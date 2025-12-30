package com.creatorx.service;

import com.creatorx.common.enums.AdminActionType;
import com.creatorx.common.enums.DisputeStatus;
import com.creatorx.common.enums.DisputeType;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.DisputeEvidenceRepository;
import com.creatorx.repository.DisputeRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.Dispute;
import com.creatorx.repository.entity.DisputeEvidence;
import com.creatorx.repository.entity.User;
import com.creatorx.service.admin.AdminAuditService;
import com.creatorx.service.dto.DisputeDTO;
import com.creatorx.service.dto.DisputeEvidenceDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DisputeService {
    private final DisputeRepository disputeRepository;
    private final DisputeEvidenceRepository disputeEvidenceRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final AdminAuditService adminAuditService;

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
                .build();

        return toDTO(disputeRepository.save(dispute));
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
    public Page<DisputeDTO> getDisputesForUser(String userId, Pageable pageable) {
        return disputeRepository.findByUserId(userId, pageable).map(this::toDTO);
    }

    @Transactional
    public DisputeDTO resolveDispute(String adminId, String disputeId, DisputeStatus status, String resolution) {
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

        dispute.setStatus(status);
        dispute.setResolution(resolution);
        dispute.setResolvedBy(admin);
        dispute.setResolvedAt(LocalDateTime.now());

        Dispute updated = disputeRepository.save(dispute);

        HashMap<String, Object> details = new HashMap<>();
        details.put("status", status != null ? status.name() : null);
        details.put("resolution", resolution);

        adminAuditService.logAction(
                adminId,
                AdminActionType.DISPUTE_RESOLVED,
                "DISPUTE",
                updated.getId(),
                details,
                null,
                null
        );

        return toDTO(updated);
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
}
