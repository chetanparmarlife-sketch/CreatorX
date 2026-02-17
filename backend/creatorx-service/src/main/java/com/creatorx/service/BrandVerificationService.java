package com.creatorx.service;

import com.creatorx.common.enums.OnboardingStatus;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.BrandVerificationDocumentRepository;
import com.creatorx.repository.CampaignFlagRepository;
import com.creatorx.repository.DisputeRepository;
import com.creatorx.repository.BrandProfileRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.BrandProfile;
import com.creatorx.repository.entity.BrandVerificationDocument;
import com.creatorx.repository.entity.User;
import com.creatorx.service.admin.AdminAuditService;
import com.creatorx.service.dto.BrandProfileSummaryDTO;
import com.creatorx.service.dto.BrandVerificationDetailDTO;
import com.creatorx.service.dto.BrandVerificationHistoryDTO;
import com.creatorx.service.dto.BrandVerificationRiskDTO;
import com.creatorx.service.dto.BrandVerificationStatusDTO;
import com.creatorx.service.dto.FileUploadResponse;
import com.creatorx.service.storage.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BrandVerificationService {
    private static final String DOCUMENT_TYPE_GST = "GST";

    private final BrandVerificationDocumentRepository brandVerificationRepository;
    private final BrandProfileRepository brandProfileRepository;
    private final UserRepository userRepository;
    private final SupabaseStorageService storageService;
    private final AdminAuditService adminAuditService;
    private final DisputeRepository disputeRepository;
    private final CampaignFlagRepository campaignFlagRepository;

    @Transactional
    public BrandVerificationStatusDTO submitGstDocument(String brandId, String gstNumber, MultipartFile file) {
        User brand = userRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("User", brandId));

        BrandProfile profile = brandProfileRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("BrandProfile", brandId));

        if (gstNumber == null || gstNumber.trim().isEmpty()) {
            throw new BusinessException("GST number is required");
        }

        FileUploadResponse upload = storageService.uploadBrandVerificationDocument(brandId, file);

        profile.setGstNumber(gstNumber);
        profile.setVerified(false);
        profile.setOnboardingStatus(OnboardingStatus.SUBMITTED);
        brandProfileRepository.save(profile);

        BrandVerificationDocument document = BrandVerificationDocument.builder()
                .brand(brand)
                .documentType(DOCUMENT_TYPE_GST)
                .fileUrl(upload.getFileUrl())
                .status("PENDING")
                .submittedAt(LocalDateTime.now())
                .build();

        BrandVerificationDocument saved = brandVerificationRepository.save(document);

        log.info("GST verification document submitted for brand {}", brandId);

        return BrandVerificationStatusDTO.builder()
                .documentId(saved.getId())
                .brandId(brandId)
                .brandEmail(brand.getEmail())
                .status(saved.getStatus())
                .onboardingStatus(OnboardingStatus.SUBMITTED.name())
                .fileUrl(saved.getFileUrl())
                .submittedAt(saved.getSubmittedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public BrandVerificationStatusDTO getLatestStatus(String brandId) {
        BrandProfile profile = brandProfileRepository.findById(brandId).orElse(null);
        String onboardingStatus = profile != null && profile.getOnboardingStatus() != null
                ? profile.getOnboardingStatus().name() : null;

        return brandVerificationRepository.findFirstByBrandIdOrderBySubmittedAtDesc(brandId)
                .map((document) -> BrandVerificationStatusDTO.builder()
                        .documentId(document.getId())
                        .brandId(document.getBrand().getId())
                        .brandEmail(document.getBrand().getEmail())
                        .status(document.getStatus())
                        .onboardingStatus(onboardingStatus)
                        .fileUrl(document.getFileUrl())
                        .rejectionReason(document.getRejectionReason())
                        .submittedAt(document.getSubmittedAt())
                        .reviewedAt(document.getReviewedAt())
                        .build())
                .orElse(BrandVerificationStatusDTO.builder()
                        .status("NOT_SUBMITTED")
                        .onboardingStatus(onboardingStatus)
                        .build());
    }

    @Transactional(readOnly = true)
    public Page<BrandVerificationStatusDTO> getPendingDocuments(Pageable pageable) {
        return brandVerificationRepository.findByStatus("PENDING", pageable)
                .map((document) -> BrandVerificationStatusDTO.builder()
                        .documentId(document.getId())
                        .brandId(document.getBrand().getId())
                        .brandEmail(document.getBrand().getEmail())
                        .status(document.getStatus())
                        .fileUrl(document.getFileUrl())
                        .rejectionReason(document.getRejectionReason())
                        .submittedAt(document.getSubmittedAt())
                        .reviewedAt(document.getReviewedAt())
                        .build());
    }

    @Transactional
    public BrandVerificationStatusDTO reviewDocument(String adminId, String documentId, String status, String reason) {
        BrandVerificationDocument document = brandVerificationRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("BrandVerificationDocument", documentId));

        // Eagerly initialize the brand to avoid lazy loading issues
        User brand = document.getBrand();
        org.hibernate.Hibernate.initialize(brand);

        String normalized = status != null ? status.trim().toUpperCase() : "";
        if (!"APPROVED".equals(normalized) && !"REJECTED".equals(normalized)) {
            throw new BusinessException("Status must be APPROVED or REJECTED");
        }

        document.setStatus(normalized);
        document.setReviewedAt(LocalDateTime.now());
        document.setRejectionReason("REJECTED".equals(normalized) ? reason : null);
        brandVerificationRepository.save(document);

        BrandProfile profile = brandProfileRepository.findById(brand.getId())
                .orElseThrow(() -> new ResourceNotFoundException("BrandProfile", brand.getId()));
        profile.setVerified("APPROVED".equals(normalized));
        profile.setOnboardingStatus("APPROVED".equals(normalized)
                ? OnboardingStatus.APPROVED
                : OnboardingStatus.REJECTED);
        brandProfileRepository.save(profile);

        try {
            java.util.Map<String, Object> details = new java.util.HashMap<>();
            details.put("status", normalized);
            if (reason != null) {
                details.put("reason", reason);
            }
            adminAuditService.logAction(
                    adminId,
                    com.creatorx.common.enums.AdminActionType.SYSTEM_UPDATE,
                    "BRAND_VERIFICATION",
                    document.getId(),
                    details,
                    null,
                    null
            );
        } catch (Exception e) {
            log.warn("Failed to log audit action for brand verification review: {}", e.getMessage());
        }

        return BrandVerificationStatusDTO.builder()
                .documentId(document.getId())
                .brandId(brand.getId())
                .brandEmail(brand.getEmail())
                .status(document.getStatus())
                .onboardingStatus(profile.getOnboardingStatus() != null
                        ? profile.getOnboardingStatus().name() : null)
                .fileUrl(document.getFileUrl())
                .rejectionReason(document.getRejectionReason())
                .submittedAt(document.getSubmittedAt())
                .reviewedAt(document.getReviewedAt())
                .build();
    }

    @Transactional
    public void bulkReview(String adminId, java.util.List<String> documentIds, String status, String reason) {
        if (documentIds == null || documentIds.isEmpty()) {
            return;
        }
        for (String documentId : documentIds) {
            reviewDocument(adminId, documentId, status, reason);
        }
    }

    @Transactional(readOnly = true)
    public BrandVerificationDetailDTO getAdminDetail(String documentId) {
        BrandVerificationDocument document = brandVerificationRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("BrandVerificationDocument", documentId));

        // Eagerly initialize the brand to avoid lazy loading issues
        User brand = document.getBrand();
        org.hibernate.Hibernate.initialize(brand);

        BrandProfile profile = brandProfileRepository.findById(brand.getId()).orElse(null);

        List<BrandVerificationHistoryDTO> history = brandVerificationRepository
                .findTop5ByBrandIdOrderBySubmittedAtDesc(brand.getId())
                .stream()
                .map(item -> BrandVerificationHistoryDTO.builder()
                        .documentId(item.getId())
                        .status(item.getStatus())
                        .rejectionReason(item.getRejectionReason())
                        .fileUrl(item.getFileUrl())
                        .submittedAt(item.getSubmittedAt())
                        .reviewedAt(item.getReviewedAt())
                        .build())
                .toList();

        long priorRejections = brandVerificationRepository.countByBrandIdAndStatus(brand.getId(), "REJECTED");

        // Risk metrics - wrap in try-catch since these are non-critical
        long openDisputes = 0;
        long openFlags = 0;
        try {
            openDisputes = disputeRepository.countByBrandIdAndStatus(brand.getId(), com.creatorx.common.enums.DisputeStatus.OPEN)
                    + disputeRepository.countByBrandIdAndStatus(brand.getId(), com.creatorx.common.enums.DisputeStatus.IN_REVIEW);
        } catch (Exception e) {
            log.warn("Failed to count open disputes for brand {}: {}", brand.getId(), e.getMessage());
        }
        try {
            openFlags = campaignFlagRepository.countByBrandIdAndStatus(
                    brand.getId(),
                    com.creatorx.common.enums.CampaignFlagStatus.OPEN
            );
        } catch (Exception e) {
            log.warn("Failed to count open campaign flags for brand {}: {}", brand.getId(), e.getMessage());
        }

        BrandProfileSummaryDTO profileSummary = BrandProfileSummaryDTO.builder()
                .brandId(brand.getId())
                .brandEmail(brand.getEmail())
                .companyName(profile != null ? profile.getCompanyName() : null)
                .industry(profile != null ? profile.getIndustry() : null)
                .website(profile != null ? profile.getWebsite() : null)
                .gstNumber(profile != null ? profile.getGstNumber() : null)
                .verified(profile != null ? profile.getVerified() : false)
                .onboardingStatus(profile != null && profile.getOnboardingStatus() != null
                        ? profile.getOnboardingStatus().name() : null)
                .companyLogoUrl(profile != null ? profile.getCompanyLogoUrl() : null)
                .userStatus(brand.getStatus() != null ? brand.getStatus().name() : null)
                .build();

        BrandVerificationRiskDTO risk = BrandVerificationRiskDTO.builder()
                .priorRejections(priorRejections)
                .openDisputes(openDisputes)
                .openCampaignFlags(openFlags)
                .userStatus(brand.getStatus() != null ? brand.getStatus().name() : null)
                .build();

        return BrandVerificationDetailDTO.builder()
                .documentId(document.getId())
                .brandId(brand.getId())
                .brandEmail(brand.getEmail())
                .status(document.getStatus())
                .fileUrl(document.getFileUrl())
                .rejectionReason(document.getRejectionReason())
                .submittedAt(document.getSubmittedAt())
                .reviewedAt(document.getReviewedAt())
                .profile(profileSummary)
                .risk(risk)
                .history(history)
                .build();
    }
}
