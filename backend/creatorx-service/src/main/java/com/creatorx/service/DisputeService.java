package com.creatorx.service;

import com.creatorx.common.enums.AdminActionType;
import com.creatorx.common.enums.DisputeStatus;
import com.creatorx.common.enums.DisputeType;
import com.creatorx.common.enums.NotificationType;
import com.creatorx.common.enums.TransactionType;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.DisputeEvidenceRepository;
import com.creatorx.repository.DisputeNoteRepository;
import com.creatorx.repository.DisputeRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.Dispute;
import com.creatorx.repository.entity.DisputeEvidence;
import com.creatorx.repository.entity.DisputeNote;
import com.creatorx.repository.entity.User;
import com.creatorx.service.admin.AdminAuditService;
import com.creatorx.service.dto.DisputeDTO;
import com.creatorx.service.dto.DisputeEvidenceDTO;
import com.creatorx.service.dto.DisputeNoteDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DisputeService {
    private final DisputeRepository disputeRepository;
    private final DisputeEvidenceRepository disputeEvidenceRepository;
    private final DisputeNoteRepository disputeNoteRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final AdminAuditService adminAuditService;
    private final NotificationService notificationService;
    private final WalletService walletService;

    private static final int FIRST_RESPONSE_SLA_HOURS = 6;
    private static final int RESOLUTION_SLA_HOURS = 48;

    @Transactional
    public DisputeDTO createDispute(
            String creatorId,
            String brandId,
            String campaignId,
            DisputeType type,
            String description
    ) {
        if (description == null || description.isBlank()) {
            throw new BusinessException("Description is required");
        }
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", creatorId));
        User brand = userRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("User", brandId));

        Campaign campaign = null;
        if (campaignId != null) {
            campaign = campaignRepository.findById(campaignId)
                    .orElseThrow(() -> new ResourceNotFoundException("Campaign", campaignId));
        }

        Dispute dispute = Dispute.builder()
                .creator(creator)
                .brand(brand)
                .campaign(campaign)
                .type(type != null ? type : DisputeType.OTHER)
                .description(description)
                .status(DisputeStatus.OPEN)
                .nextAction("Awaiting admin review")
                .slaFirstResponseDueAt(LocalDateTime.now().plusHours(FIRST_RESPONSE_SLA_HOURS))
                .slaResolutionDueAt(LocalDateTime.now().plusHours(RESOLUTION_SLA_HOURS))
                .build();

        Dispute saved = disputeRepository.save(dispute);
        sendNotification(
                creator.getId(),
                "Dispute created",
                "Your dispute has been submitted and is awaiting review.",
                Map.of("disputeId", saved.getId())
        );
        sendNotification(
                brand.getId(),
                "Dispute created",
                "A dispute has been submitted for review.",
                Map.of("disputeId", saved.getId())
        );
        return toDTO(saved);
    }

    @Transactional(readOnly = true)
    public Page<DisputeDTO> getDisputesForAdmin(DisputeStatus status, DisputeType type, Pageable pageable) {
        Specification<Dispute> spec = Specification.where(null);
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), type));
        }
        return disputeRepository.findAll(spec, pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public DisputeDTO getDisputeForAdmin(String disputeId) {
        return disputeRepository.findById(disputeId)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute", disputeId));
    }

    @Transactional(readOnly = true)
    public Page<DisputeDTO> getDisputesForUser(String userId, Pageable pageable) {
        return disputeRepository.findByUserId(userId, pageable).map(this::toDTO);
    }

    @Transactional
    public DisputeDTO resolveDispute(
            String adminId,
            String disputeId,
            DisputeStatus status,
            String resolution,
            String resolutionType,
            BigDecimal actionAmount
    ) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));
        if (admin.getRole() != UserRole.ADMIN) {
            throw new BusinessException("Only admins can resolve disputes");
        }
        if (status == null) {
            throw new BusinessException("Status is required");
        }

        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute", disputeId));

        String normalizedResolutionType = resolutionType != null ? resolutionType.trim().toUpperCase() : null;
        if ("REFUND".equals(normalizedResolutionType) || "PENALTY".equals(normalizedResolutionType)) {
            if (actionAmount == null || actionAmount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("Action amount is required for refund or penalty resolutions");
            }
            handleFinancialResolution(dispute, adminId, normalizedResolutionType, actionAmount, resolution);
        }

        dispute.setStatus(status);
        dispute.setResolution(resolution);
        dispute.setResolutionType(normalizedResolutionType != null ? normalizedResolutionType : resolutionType);
        dispute.setResolvedBy(admin);
        dispute.setResolvedAt(LocalDateTime.now());

        Dispute updated = disputeRepository.save(dispute);

        HashMap<String, Object> details = new HashMap<>();
        details.put("status", status != null ? status.name() : null);
        details.put("resolution", resolution);
        details.put("resolutionType", resolutionType);

        adminAuditService.logAction(
                adminId,
                AdminActionType.DISPUTE_RESOLVED,
                "DISPUTE",
                updated.getId(),
                details,
                null,
                null
        );

        sendNotification(
                updated.getCreator().getId(),
                "Dispute resolved",
                "Your dispute has been resolved by the admin team.",
                Map.of("disputeId", updated.getId())
        );
        sendNotification(
                updated.getBrand().getId(),
                "Dispute resolved",
                "A dispute you are part of has been resolved.",
                Map.of("disputeId", updated.getId())
        );

        return toDTO(updated);
    }

    private void handleFinancialResolution(
            Dispute dispute,
            String adminId,
            String resolutionType,
            BigDecimal actionAmount,
            String resolutionNotes
    ) {
        String campaignId = dispute.getCampaign() != null ? dispute.getCampaign().getId() : null;
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("disputeId", dispute.getId());
        metadata.put("resolutionType", resolutionType);
        if (resolutionNotes != null && !resolutionNotes.isBlank()) {
            metadata.put("resolutionNotes", resolutionNotes);
        }

        if ("REFUND".equals(resolutionType)) {
            walletService.creditWalletWithType(
                    dispute.getBrand().getId(),
                    actionAmount,
                    "Dispute refund",
                    campaignId,
                    TransactionType.REFUND,
                    metadata
            );
            logFinancialAction(adminId, dispute, resolutionType, actionAmount, dispute.getBrand().getId());
            return;
        }

        walletService.debitWalletWithType(
                dispute.getCreator().getId(),
                actionAmount,
                "Dispute penalty",
                campaignId,
                TransactionType.PENALTY,
                metadata
        );
        logFinancialAction(adminId, dispute, resolutionType, actionAmount, dispute.getCreator().getId());
    }

    private void logFinancialAction(
            String adminId,
            Dispute dispute,
            String resolutionType,
            BigDecimal actionAmount,
            String targetUserId
    ) {
        Map<String, Object> details = new HashMap<>();
        details.put("resolutionType", resolutionType);
        details.put("actionAmount", actionAmount);
        details.put("targetUserId", targetUserId);
        details.put("campaignId", dispute.getCampaign() != null ? dispute.getCampaign().getId() : null);

        adminAuditService.logAction(
                adminId,
                AdminActionType.SYSTEM_UPDATE,
                "DISPUTE_ACTION",
                dispute.getId(),
                details,
                null,
                null
        );
    }

    @Transactional
    public DisputeDTO assignDispute(String actingAdminId, String disputeId, String adminId, String nextAction) {
        User actingAdmin = requireAdmin(actingAdminId);
        User assignee = adminId != null ? requireAdmin(adminId) : actingAdmin;

        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute", disputeId));

        dispute.setAssignedAdmin(assignee);
        if (nextAction != null && !nextAction.isBlank()) {
            dispute.setNextAction(nextAction);
        }
        if (dispute.getStatus() == DisputeStatus.OPEN) {
            dispute.setStatus(DisputeStatus.IN_REVIEW);
        }

        Dispute updated = disputeRepository.save(dispute);

        HashMap<String, Object> details = new HashMap<>();
        details.put("assignedAdminId", assignee.getId());
        details.put("nextAction", dispute.getNextAction());

        adminAuditService.logAction(
                actingAdminId,
                AdminActionType.SYSTEM_UPDATE,
                "DISPUTE",
                updated.getId(),
                details,
                null,
                null
        );

        return toDTO(updated);
    }

    @Transactional
    public DisputeNoteDTO addInternalNote(String adminId, String disputeId, String note) {
        User admin = requireAdmin(adminId);
        if (note == null || note.isBlank()) {
            throw new BusinessException("Note is required");
        }
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute", disputeId));

        DisputeNote saved = disputeNoteRepository.save(DisputeNote.builder()
                .dispute(dispute)
                .admin(admin)
                .note(note)
                .build());

        return toNoteDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<DisputeNoteDTO> getInternalNotes(String disputeId) {
        return disputeNoteRepository.findByDisputeIdOrderByCreatedAtDesc(disputeId).stream()
                .map(this::toNoteDTO)
                .toList();
    }

    @Transactional
    public DisputeEvidenceDTO addEvidence(String disputeId, String userId, String fileUrl, String fileType, String notes) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute", disputeId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (!dispute.getCreator().getId().equals(userId) && !dispute.getBrand().getId().equals(userId)) {
            throw new BusinessException("Only dispute participants can upload evidence");
        }

        DisputeEvidence evidence = DisputeEvidence.builder()
                .dispute(dispute)
                .submittedBy(user)
                .fileUrl(fileUrl)
                .fileType(fileType)
                .notes(notes)
                .build();

        return toEvidenceDTO(disputeEvidenceRepository.save(evidence));
    }

    @Transactional(readOnly = true)
    public List<DisputeEvidenceDTO> getEvidence(String disputeId) {
        return disputeEvidenceRepository.findByDisputeId(disputeId).stream()
                .map(this::toEvidenceDTO)
                .toList();
    }

    private DisputeDTO toDTO(Dispute dispute) {
        List<DisputeEvidenceDTO> evidence = disputeEvidenceRepository.findByDisputeId(dispute.getId()).stream()
                .map(this::toEvidenceDTO)
                .toList();

        return DisputeDTO.builder()
                .id(dispute.getId())
                .campaignId(dispute.getCampaign() != null ? dispute.getCampaign().getId() : null)
                .campaignTitle(dispute.getCampaign() != null ? dispute.getCampaign().getTitle() : null)
                .creatorId(dispute.getCreator().getId())
                .creatorEmail(dispute.getCreator().getEmail())
                .brandId(dispute.getBrand().getId())
                .brandEmail(dispute.getBrand().getEmail())
                .type(dispute.getType())
                .status(dispute.getStatus())
                .description(dispute.getDescription())
                .resolution(dispute.getResolution())
                .assignedAdminId(dispute.getAssignedAdmin() != null ? dispute.getAssignedAdmin().getId() : null)
                .nextAction(dispute.getNextAction())
                .resolutionType(dispute.getResolutionType())
                .slaFirstResponseDueAt(dispute.getSlaFirstResponseDueAt())
                .slaResolutionDueAt(dispute.getSlaResolutionDueAt())
                .resolvedBy(dispute.getResolvedBy() != null ? dispute.getResolvedBy().getId() : null)
                .createdAt(dispute.getCreatedAt())
                .resolvedAt(dispute.getResolvedAt())
                .evidence(evidence)
                .build();
    }

    private DisputeEvidenceDTO toEvidenceDTO(DisputeEvidence evidence) {
        return DisputeEvidenceDTO.builder()
                .id(evidence.getId())
                .fileUrl(evidence.getFileUrl())
                .fileType(evidence.getFileType())
                .notes(evidence.getNotes())
                .submittedBy(evidence.getSubmittedBy().getId())
                .submittedAt(evidence.getCreatedAt())
                .build();
    }

    private DisputeNoteDTO toNoteDTO(DisputeNote note) {
        return DisputeNoteDTO.builder()
                .id(note.getId())
                .disputeId(note.getDispute().getId())
                .adminId(note.getAdmin().getId())
                .adminEmail(note.getAdmin().getEmail())
                .note(note.getNote())
                .createdAt(note.getCreatedAt())
                .build();
    }

    private User requireAdmin(String adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));
        if (admin.getRole() != UserRole.ADMIN) {
            throw new BusinessException("Only admins can perform this action");
        }
        return admin;
    }

    private void sendNotification(String userId, String title, String body, Map<String, Object> data) {
        try {
            notificationService.createNotification(userId, NotificationType.SYSTEM, title, body, data);
        } catch (Exception e) {
            // Notification failures should not block dispute workflows
        }
    }
}
