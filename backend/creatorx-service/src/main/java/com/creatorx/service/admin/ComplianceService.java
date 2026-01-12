package com.creatorx.service.admin;

import com.creatorx.common.enums.GDPRRequestStatus;
import com.creatorx.common.enums.GDPRRequestType;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.common.enums.NotificationType;
import com.creatorx.repository.ApplicationRepository;
import com.creatorx.repository.BrandProfileRepository;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.CreatorProfileRepository;
import com.creatorx.repository.GDPRRequestRepository;
import com.creatorx.repository.KYCDocumentRepository;
import com.creatorx.repository.NotificationRepository;
import com.creatorx.repository.TransactionRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.UserProfileRepository;
import com.creatorx.repository.DisputeRepository;
import com.creatorx.repository.entity.GDPRRequest;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.GDPRRequestDTO;
import com.creatorx.service.storage.SupabaseStorageService;
import com.creatorx.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplianceService {
    private final GDPRRequestRepository gdprRequestRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final BrandProfileRepository brandProfileRepository;
    private final KYCDocumentRepository kycDocumentRepository;
    private final CampaignRepository campaignRepository;
    private final ApplicationRepository applicationRepository;
    private final TransactionRepository transactionRepository;
    private final DisputeRepository disputeRepository;
    private final NotificationRepository notificationRepository;
    private final SupabaseStorageService storageService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;
    private final AdminAuditService adminAuditService;

    @Transactional
    public GDPRRequestDTO submitRequest(String userId, GDPRRequestType type, Map<String, Object> details) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (type == null) {
            throw new BusinessException("Request type is required");
        }

        GDPRRequest request = GDPRRequest.builder()
                .user(user)
                .requestType(type)
                .status(GDPRRequestStatus.PENDING)
                .detailsJson(details != null ? details : new HashMap<>())
                .build();

        return toDTO(gdprRequestRepository.save(request));
    }

    @Transactional(readOnly = true)
    public Page<GDPRRequestDTO> getRequests(GDPRRequestStatus status, GDPRRequestType type, Pageable pageable) {
        Specification<GDPRRequest> spec = Specification.where(null);
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("requestType"), type));
        }
        return gdprRequestRepository.findAll(spec, pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<GDPRRequestDTO> getRequestsForUser(String userId, Pageable pageable) {
        return gdprRequestRepository.findByUserId(userId, pageable).map(this::toDTO);
    }

    @Transactional
    public GDPRRequestDTO updateRequest(String adminId, String requestId, GDPRRequestStatus status, String exportUrl) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));
        if (admin.getRole() != UserRole.ADMIN) {
            throw new BusinessException("Only admins can update GDPR requests");
        }
        if (status == null) {
            throw new BusinessException("Status is required");
        }

        GDPRRequest request = gdprRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("GDPRRequest", requestId));

        request.setStatus(status);
        request.setExportUrl(exportUrl);
        request.setResolvedBy(admin);
        request.setResolvedAt(LocalDateTime.now());

        GDPRRequest updated = gdprRequestRepository.save(request);

        HashMap<String, Object> details = new HashMap<>();
        details.put("status", status != null ? status.name() : null);
        details.put("exportUrl", exportUrl);

        adminAuditService.logAction(
                adminId,
                com.creatorx.common.enums.AdminActionType.SYSTEM_UPDATE,
                "GDPR_REQUEST",
                updated.getId(),
                details,
                null,
                null
        );

        return toDTO(updated);
    }

    @Transactional
    public GDPRRequestDTO generateExport(String adminId, String requestId) {
        User admin = requireAdmin(adminId);
        GDPRRequest request = gdprRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("GDPRRequest", requestId));
        if (request.getRequestType() != GDPRRequestType.EXPORT) {
            throw new BusinessException("Request type is not EXPORT");
        }

        request.setStatus(GDPRRequestStatus.IN_PROGRESS);
        gdprRequestRepository.save(request);

        Map<String, Object> exportData = buildExportData(request.getUser().getId());
        byte[] payload;
        try {
            payload = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(exportData);
        } catch (Exception e) {
            throw new BusinessException("Failed to serialize export data: " + e.getMessage());
        }

        String fileName = String.format("gdpr-export-%s-%s.json", request.getUser().getId(), UUID.randomUUID());
        var upload = storageService.uploadExport(fileName, payload, "application/json");
        String signedUrl = storageService.generateSignedUrl(upload.getFileUrl(), 7 * 24 * 3600).getSignedUrl();

        request.setExportUrl(signedUrl);
        request.setStatus(GDPRRequestStatus.COMPLETED);
        request.setResolvedBy(admin);
        request.setResolvedAt(LocalDateTime.now());

        HashMap<String, Object> details = new HashMap<>(request.getDetailsJson() != null ? request.getDetailsJson() : new HashMap<>());
        details.put("exportFileUrl", upload.getFileUrl());
        details.put("exportGeneratedAt", LocalDateTime.now().toString());
        request.setDetailsJson(details);

        GDPRRequest updated = gdprRequestRepository.save(request);

        adminAuditService.logAction(
                adminId,
                com.creatorx.common.enums.AdminActionType.SYSTEM_UPDATE,
                "GDPR_EXPORT",
                updated.getId(),
                Map.of("exportUrl", signedUrl),
                null,
                null
        );

        notificationService.createNotification(
                request.getUser().getId(),
                NotificationType.SYSTEM,
                "Your data export is ready",
                "Your GDPR data export is ready for download.",
                Map.of("exportUrl", signedUrl)
        );

        return toDTO(updated);
    }

    @Transactional
    public GDPRRequestDTO anonymizeUser(String adminId, String requestId) {
        User admin = requireAdmin(adminId);
        GDPRRequest request = gdprRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("GDPRRequest", requestId));
        if (request.getRequestType() != GDPRRequestType.DELETE) {
            throw new BusinessException("Request type is not DELETE");
        }

        request.setStatus(GDPRRequestStatus.IN_PROGRESS);
        gdprRequestRepository.save(request);

        User user = request.getUser();
        anonymizeUserRecord(user);

        request.setStatus(GDPRRequestStatus.COMPLETED);
        request.setResolvedBy(admin);
        request.setResolvedAt(LocalDateTime.now());

        HashMap<String, Object> details = new HashMap<>(request.getDetailsJson() != null ? request.getDetailsJson() : new HashMap<>());
        details.put("anonymizedAt", LocalDateTime.now().toString());
        request.setDetailsJson(details);

        GDPRRequest updated = gdprRequestRepository.save(request);

        adminAuditService.logAction(
                adminId,
                com.creatorx.common.enums.AdminActionType.SYSTEM_UPDATE,
                "GDPR_DELETE",
                updated.getId(),
                Map.of("userId", user.getId()),
                null,
                null
        );

        return toDTO(updated);
    }

    private GDPRRequestDTO toDTO(GDPRRequest request) {
        return GDPRRequestDTO.builder()
                .id(request.getId())
                .userId(request.getUser().getId())
                .userEmail(request.getUser().getEmail())
                .requestType(request.getRequestType())
                .status(request.getStatus())
                .details(request.getDetailsJson())
                .exportUrl(request.getExportUrl())
                .resolvedBy(request.getResolvedBy() != null ? request.getResolvedBy().getId() : null)
                .createdAt(request.getCreatedAt())
                .resolvedAt(request.getResolvedAt())
                .build();
    }

    private Map<String, Object> buildExportData(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Map<String, Object> export = new HashMap<>();
        export.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "status", user.getStatus(),
                "createdAt", user.getCreatedAt()
        ));

        export.put("userProfile", userProfileRepository.findById(userId).orElse(null));
        export.put("creatorProfile", creatorProfileRepository.findById(userId).orElse(null));
        export.put("brandProfile", brandProfileRepository.findById(userId).orElse(null));
        export.put("kycDocuments", kycDocumentRepository.findByUserId(userId));
        export.put("campaigns", campaignRepository.findByBrandId(userId, Pageable.unpaged()).getContent());
        export.put("applications", applicationRepository.findByUserId(userId, Pageable.unpaged()).getContent());
        export.put("transactions", transactionRepository.findByUserId(userId, Pageable.unpaged()).getContent());
        export.put("disputes", disputeRepository.findByUserId(userId, Pageable.unpaged()).getContent());
        export.put("notifications", notificationRepository.findByUserId(userId, Pageable.unpaged()).getContent());

        return export;
    }

    private void anonymizeUserRecord(User user) {
        String userId = user.getId();
        user.setEmail("deleted+" + userId + "@creatorx.local");
        user.setPhone(null);
        user.setSupabaseId(null);
        user.setPasswordHash("deleted");
        user.setStatus(com.creatorx.common.enums.UserStatus.DELETED);
        userRepository.save(user);

        userProfileRepository.findById(userId).ifPresent(profile -> {
            profile.setFullName("Deleted User");
            profile.setBio(null);
            profile.setAvatarUrl(null);
            userProfileRepository.save(profile);
        });

        creatorProfileRepository.findById(userId).ifPresent(profile -> {
            profile.setUsername("deleted_" + userId.substring(0, Math.min(userId.length(), 8)));
            profile.setCategory("Other");
            profile.setInstagramUrl(null);
            profile.setYoutubeUrl(null);
            profile.setTiktokUrl(null);
            profile.setTwitterUrl(null);
            profile.setPortfolioItems(List.of());
            creatorProfileRepository.save(profile);
        });

        brandProfileRepository.findById(userId).ifPresent(profile -> {
            profile.setCompanyName("Deleted Brand " + userId.substring(0, Math.min(userId.length(), 6)));
            profile.setGstNumber(null);
            profile.setIndustry(null);
            profile.setWebsite(null);
            profile.setCompanyLogoUrl(null);
            profile.setCompanyDescription(null);
            brandProfileRepository.save(profile);
        });

        kycDocumentRepository.findByUserId(userId).forEach(doc -> {
            if (doc.getDocumentUrl() != null) {
                storageService.deleteFile(doc.getDocumentUrl());
            }
            doc.setDocumentUrl(null);
            kycDocumentRepository.save(doc);
        });
    }

    private User requireAdmin(String adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));
        if (admin.getRole() != UserRole.ADMIN) {
            throw new BusinessException("Only admins can perform compliance actions");
        }
        return admin;
    }
}
