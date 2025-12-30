package com.creatorx.service;

import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.BrandVerificationDocumentRepository;
import com.creatorx.repository.BrandProfileRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.BrandProfile;
import com.creatorx.repository.entity.BrandVerificationDocument;
import com.creatorx.repository.entity.User;
import com.creatorx.service.admin.AdminAuditService;
import com.creatorx.service.dto.BrandVerificationStatusDTO;
import com.creatorx.service.dto.FileUploadResponse;
import com.creatorx.service.storage.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

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
                .fileUrl(saved.getFileUrl())
                .submittedAt(saved.getSubmittedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public BrandVerificationStatusDTO getLatestStatus(String brandId) {
        return brandVerificationRepository.findFirstByBrandIdOrderBySubmittedAtDesc(brandId)
                .map((document) -> BrandVerificationStatusDTO.builder()
                        .documentId(document.getId())
                        .brandId(document.getBrand().getId())
                        .brandEmail(document.getBrand().getEmail())
                        .status(document.getStatus())
                        .fileUrl(document.getFileUrl())
                        .rejectionReason(document.getRejectionReason())
                        .submittedAt(document.getSubmittedAt())
                        .reviewedAt(document.getReviewedAt())
                        .build())
                .orElse(BrandVerificationStatusDTO.builder()
                        .status("NOT_SUBMITTED")
                        .build());
    }

    @Transactional(readOnly = true)
    public List<BrandVerificationStatusDTO> getPendingDocuments() {
        return brandVerificationRepository.findByStatusOrderBySubmittedAtDesc("PENDING")
                .stream()
                .map((document) -> BrandVerificationStatusDTO.builder()
                        .documentId(document.getId())
                        .brandId(document.getBrand().getId())
                        .brandEmail(document.getBrand().getEmail())
                        .status(document.getStatus())
                        .fileUrl(document.getFileUrl())
                        .rejectionReason(document.getRejectionReason())
                        .submittedAt(document.getSubmittedAt())
                        .reviewedAt(document.getReviewedAt())
                        .build())
                .toList();
    }

    @Transactional
    public BrandVerificationStatusDTO reviewDocument(String adminId, String documentId, String status, String reason) {
        BrandVerificationDocument document = brandVerificationRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("BrandVerificationDocument", documentId));

        String normalized = status != null ? status.trim().toUpperCase() : "";
        if (!"APPROVED".equals(normalized) && !"REJECTED".equals(normalized)) {
            throw new BusinessException("Status must be APPROVED or REJECTED");
        }

        document.setStatus(normalized);
        document.setReviewedAt(LocalDateTime.now());
        document.setRejectionReason("REJECTED".equals(normalized) ? reason : null);
        brandVerificationRepository.save(document);

        BrandProfile profile = brandProfileRepository.findById(document.getBrand().getId())
                .orElseThrow(() -> new ResourceNotFoundException("BrandProfile", document.getBrand().getId()));
        profile.setVerified("APPROVED".equals(normalized));
        brandProfileRepository.save(profile);

        adminAuditService.logAction(
                adminId,
                com.creatorx.common.enums.AdminActionType.SYSTEM_UPDATE,
                "BRAND_VERIFICATION",
                document.getId(),
                java.util.Map.of("status", normalized, "reason", reason),
                null,
                null
        );

        return BrandVerificationStatusDTO.builder()
                .documentId(document.getId())
                .brandId(document.getBrand().getId())
                .brandEmail(document.getBrand().getEmail())
                .status(document.getStatus())
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
}
