package com.creatorx.service;

import com.creatorx.common.enums.DocumentStatus;
import com.creatorx.common.enums.DocumentType;
import com.creatorx.common.enums.NotificationType;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.common.exception.UnauthorizedException;
import com.creatorx.repository.KYCDocumentRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.KYCDocument;
import com.creatorx.repository.entity.User;
import com.creatorx.service.admin.AdminAuditService;
import com.creatorx.service.dto.FileUploadResponse;
import com.creatorx.service.dto.KYCDocumentDTO;
import com.creatorx.service.dto.KYCStatusDTO;
import com.creatorx.service.storage.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class KYCService {
    
    private final KYCDocumentRepository kycDocumentRepository;
    private final UserRepository userRepository;
    private final SupabaseStorageService storageService;
    private final NotificationService notificationService;
    private final AdminAuditService adminAuditService;
    
    /**
     * Submit KYC document
     */
    @Transactional
    public KYCDocumentDTO submitKYC(String userId, DocumentType documentType, String documentNumber,
                                    MultipartFile frontImage, MultipartFile backImage) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        // Validate document number if provided
        if (documentNumber != null && !documentNumber.isEmpty()) {
            validateDocumentNumber(documentType, documentNumber);
        }
        
        // Check if there's already a pending document of this type
        kycDocumentRepository.findPendingByUserIdAndDocumentType(userId, documentType)
                .ifPresent(existing -> {
                    throw new BusinessException("You already have a pending " + documentType + " document. Please wait for review.");
                });
        
        // Upload front image
        FileUploadResponse frontUpload = storageService.uploadKYCDocument(
                userId,
                documentType.name(),
                frontImage
        );
        
        // Upload back image if provided (for AADHAAR)
        String backImageUrl = null;
        if (backImage != null && !backImage.isEmpty()) {
            if (documentType != DocumentType.AADHAAR) {
                throw new BusinessException("Back image is only required for AADHAAR documents");
            }
            FileUploadResponse backUpload = storageService.uploadKYCDocument(
                    userId,
                    documentType.name() + "_back",
                    backImage
            );
            backImageUrl = backUpload.getFileUrl();
        }
        
        // Create KYC document
        KYCDocument kycDocument = KYCDocument.builder()
                .user(user)
                .documentType(documentType)
                .documentNumber(documentNumber)
                .documentUrl(frontUpload.getFileUrl())
                .backImageUrl(backImageUrl)
                .status(DocumentStatus.PENDING)
                .build();
        
        kycDocument = kycDocumentRepository.save(kycDocument);
        
        log.info("KYC document submitted: {} for user: {} type: {}", kycDocument.getId(), userId, documentType);
        
        // Notify admins (new KYC pending)
        notifyAdminsNewKYC(kycDocument);
        
        return toDTO(kycDocument);
    }
    
    /**
     * Get KYC status for user
     */
    @Transactional(readOnly = true)
    public KYCStatusDTO getKYCStatus(String userId) {
        List<KYCDocument> documents = kycDocumentRepository.findByUserId(userId);
        
        boolean isVerified = kycDocumentRepository.countApprovedByUserId(userId) > 0;
        
        String overallStatus = calculateOverallStatus(documents, isVerified);
        
        return KYCStatusDTO.builder()
                .isVerified(isVerified)
                .overallStatus(overallStatus)
                .documents(documents.stream()
                        .map(this::toDTO)
                        .collect(Collectors.toList()))
                .build();
    }
    
    /**
     * Get all KYC documents for user
     */
    @Transactional(readOnly = true)
    public List<KYCDocumentDTO> getKYCDocuments(String userId) {
        List<KYCDocument> documents = kycDocumentRepository.findByUserId(userId);
        return documents.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get pending KYC documents for admin review
     */
    @Transactional(readOnly = true)
    public List<KYCDocumentDTO> getPendingDocuments() {
        return kycDocumentRepository.findPendingDocuments().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Bulk review KYC documents
     */
    @Transactional
    public void bulkReview(String adminId, List<String> documentIds, DocumentStatus status, String reason) {
        if (documentIds == null || documentIds.isEmpty()) {
            return;
        }
        for (String documentId : documentIds) {
            if (status == DocumentStatus.APPROVED) {
                approveKYC(adminId, documentId);
            } else if (status == DocumentStatus.REJECTED) {
                rejectKYC(adminId, documentId, reason);
            }
        }
    }
    
    /**
     * Approve KYC document (Admin only)
     */
    @Transactional
    public void approveKYC(String adminId, String documentId) {
        KYCDocument document = kycDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("KYC Document", documentId));
        
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", adminId));
        
        // Check if user is admin
        if (!admin.getRole().name().equals("ADMIN")) {
            throw new UnauthorizedException("Only admins can approve KYC documents");
        }
        
        if (document.getStatus() != DocumentStatus.PENDING) {
            throw new BusinessException("Only pending documents can be approved");
        }
        
        document.setStatus(DocumentStatus.APPROVED);
        document.setVerifiedBy(admin);
        document.setVerifiedAt(LocalDateTime.now());
        document.setRejectionReason(null);
        
        kycDocumentRepository.save(document);
        
        log.info("KYC document approved: {} by admin: {}", documentId, adminId);
        
        // Notify creator
        notifyCreatorKYCApproved(document);
        
        // Update user profile if needed (mark as verified)
        updateUserVerificationStatus(document.getUser());

        adminAuditService.logAction(
                adminId,
                com.creatorx.common.enums.AdminActionType.KYC_APPROVED,
                "KYC_DOCUMENT",
                document.getId(),
                Map.of("documentType", document.getDocumentType().name()),
                null,
                null
        );
    }
    
    /**
     * Reject KYC document (Admin only)
     */
    @Transactional
    public void rejectKYC(String adminId, String documentId, String reason) {
        KYCDocument document = kycDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("KYC Document", documentId));
        
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", adminId));
        
        // Check if user is admin
        if (!admin.getRole().name().equals("ADMIN")) {
            throw new UnauthorizedException("Only admins can reject KYC documents");
        }
        
        if (document.getStatus() != DocumentStatus.PENDING) {
            throw new BusinessException("Only pending documents can be rejected");
        }
        
        if (reason == null || reason.trim().isEmpty()) {
            throw new BusinessException("Rejection reason is required");
        }
        
        document.setStatus(DocumentStatus.REJECTED);
        document.setVerifiedBy(admin);
        document.setVerifiedAt(LocalDateTime.now());
        document.setRejectionReason(reason);
        
        kycDocumentRepository.save(document);
        
        log.info("KYC document rejected: {} by admin: {} reason: {}", documentId, adminId, reason);
        
        // Notify creator
        notifyCreatorKYCRejected(document, reason);

        adminAuditService.logAction(
                adminId,
                com.creatorx.common.enums.AdminActionType.KYC_REJECTED,
                "KYC_DOCUMENT",
                document.getId(),
                Map.of("documentType", document.getDocumentType().name(), "reason", reason),
                null,
                null
        );
    }
    
    /**
     * Check if user is KYC verified
     */
    @Transactional(readOnly = true)
    public boolean isKYCVerified(String userId) {
        return kycDocumentRepository.countApprovedByUserId(userId) > 0;
    }
    
    // Helper methods
    
    private KYCDocumentDTO toDTO(KYCDocument document) {
        return KYCDocumentDTO.builder()
                .id(document.getId())
                .userId(document.getUser().getId())
                .userEmail(document.getUser().getEmail())
                .documentType(document.getDocumentType())
                .documentNumber(document.getDocumentNumber())
                .fileUrl(document.getDocumentUrl())
                .backImageUrl(document.getBackImageUrl())
                .status(document.getStatus())
                .rejectionReason(document.getRejectionReason())
                .verifiedBy(document.getVerifiedBy() != null ? document.getVerifiedBy().getId() : null)
                .submittedAt(document.getCreatedAt())
                .verifiedAt(document.getVerifiedAt())
                .build();
    }
    
    private String calculateOverallStatus(List<KYCDocument> documents, boolean isVerified) {
        if (documents.isEmpty()) {
            return "NOT_SUBMITTED";
        }
        
        if (isVerified) {
            return "APPROVED";
        }
        
        boolean hasPending = documents.stream()
                .anyMatch(doc -> doc.getStatus() == DocumentStatus.PENDING);
        
        if (hasPending) {
            return "PENDING";
        }
        
        // All rejected or no approved
        return "REJECTED";
    }
    
    private void validateDocumentNumber(DocumentType documentType, String documentNumber) {
        switch (documentType) {
            case AADHAAR:
                if (!documentNumber.matches("^\\d{12}$")) {
                    throw new BusinessException("Aadhaar number must be exactly 12 digits");
                }
                break;
            case PAN:
                if (!documentNumber.matches("^[A-Z]{5}\\d{4}[A-Z]{1}$")) {
                    throw new BusinessException("PAN number must be in format: ABCDE1234F (5 letters, 4 digits, 1 letter)");
                }
                break;
            case GST:
                if (!documentNumber.matches("^\\d{2}[A-Z]{5}\\d{4}[A-Z]{1}[A-Z\\d]{1}[Z]{1}[A-Z\\d]{1}$")) {
                    throw new BusinessException("GST number must be in format: 22AAAAA0000A1Z5");
                }
                break;
            case PASSPORT:
                if (documentNumber.length() < 8 || documentNumber.length() > 9) {
                    throw new BusinessException("Passport number must be 8-9 characters");
                }
                break;
            case DRIVING_LICENSE:
                if (documentNumber.length() < 10 || documentNumber.length() > 20) {
                    throw new BusinessException("Driving license number must be 10-20 characters");
                }
                break;
        }
    }
    
    private void notifyAdminsNewKYC(KYCDocument document) {
        // TODO: Get all admin users and notify them
        // For now, log it
        log.info("New KYC document pending review: {} for user: {}", document.getId(), document.getUser().getId());
    }
    
    private void notifyCreatorKYCApproved(KYCDocument document) {
        Map<String, Object> data = new HashMap<>();
        data.put("documentId", document.getId());
        data.put("documentType", document.getDocumentType().name());
        
        notificationService.createNotification(
                document.getUser().getId(),
                NotificationType.SYSTEM,
                "KYC Document Approved",
                "Your " + document.getDocumentType() + " document has been approved. You can now apply to campaigns.",
                data
        );
    }
    
    private void notifyCreatorKYCRejected(KYCDocument document, String reason) {
        Map<String, Object> data = new HashMap<>();
        data.put("documentId", document.getId());
        data.put("documentType", document.getDocumentType().name());
        data.put("reason", reason);
        
        notificationService.createNotification(
                document.getUser().getId(),
                NotificationType.SYSTEM,
                "KYC Document Rejected",
                "Your " + document.getDocumentType() + " document has been rejected. Reason: " + reason,
                data
        );
    }
    
    private void updateUserVerificationStatus(User user) {
        // Check if user has at least one approved KYC document
        boolean isVerified = kycDocumentRepository.countApprovedByUserId(user.getId()) > 0;
        
        // Update user profile if needed
        if (user.getUserProfile() != null) {
            // Assuming UserProfile has a verified field
            // This would need to be implemented based on your UserProfile structure
            log.info("User verification status updated: {} - verified: {}", user.getId(), isVerified);
        }
    }
}
