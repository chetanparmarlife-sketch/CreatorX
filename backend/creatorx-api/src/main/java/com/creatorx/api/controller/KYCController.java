package com.creatorx.api.controller;

import com.creatorx.api.dto.KYCSubmitRequest;
import com.creatorx.common.enums.DocumentType;
import com.creatorx.repository.entity.User;
import com.creatorx.service.KYCService;
import com.creatorx.service.dto.KYCDocumentDTO;
import com.creatorx.service.dto.KYCStatusDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/kyc")
@Tag(name = "KYC", description = "KYC document submission and verification endpoints")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class KYCController {
    
    private final KYCService kycService;
    
    /**
     * Submit KYC document
     */
    @PostMapping(value = "/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Submit KYC document", description = "Upload KYC document for verification")
    public ResponseEntity<KYCDocumentDTO> submitKYC(
            @RequestPart("documentType") String documentTypeStr,
            @RequestPart(value = "documentNumber", required = false) String documentNumber,
            @RequestPart("frontImage") MultipartFile frontImage,
            @RequestPart(value = "backImage", required = false) MultipartFile backImage,
            Authentication authentication
    ) {
        // Validate front image is not empty
        if (frontImage == null || frontImage.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        String userId = authentication.getName();
        
        DocumentType documentType;
        try {
            documentType = DocumentType.valueOf(documentTypeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        
        KYCDocumentDTO document = kycService.submitKYC(
                userId,
                documentType,
                documentNumber,
                frontImage,
                backImage
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(document);
    }
    
    /**
     * Get KYC status
     */
    @GetMapping("/status")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get KYC status", description = "Get KYC verification status and all submitted documents")
    public ResponseEntity<KYCStatusDTO> getKYCStatus(Authentication authentication) {
        String userId = authentication.getName();
        KYCStatusDTO status = kycService.getKYCStatus(userId);
        return ResponseEntity.ok(status);
    }
    
    /**
     * Get all KYC documents
     */
    @GetMapping("/documents")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get KYC documents", description = "Get all KYC documents for current user")
    public ResponseEntity<List<KYCDocumentDTO>> getKYCDocuments(Authentication authentication) {
        String userId = authentication.getName();
        List<KYCDocumentDTO> documents = kycService.getKYCDocuments(userId);
        return ResponseEntity.ok(documents);
    }

    /**
     * Get pending KYC documents (Admin only)
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List pending KYC documents", description = "List KYC documents awaiting review (Admin only)")
    public ResponseEntity<List<KYCDocumentDTO>> getPendingDocuments() {
        return ResponseEntity.ok(kycService.getPendingDocuments());
    }

    /**
     * Bulk review KYC documents (Admin only)
     */
    @PostMapping("/documents/bulk-review")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk review KYC documents", description = "Approve or reject multiple KYC documents")
    public ResponseEntity<Void> bulkReview(
            @RequestBody com.creatorx.api.dto.KycBulkReviewRequest request,
            Authentication authentication
    ) {
        kycService.bulkReview(authentication.getName(), request.getDocumentIds(), request.getStatus(), request.getReason());
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Approve KYC document (Admin only)
     */
    @PutMapping("/documents/{documentId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve KYC document", description = "Approve a KYC document (Admin only)")
    public ResponseEntity<Void> approveKYC(
            @PathVariable String documentId,
            Authentication authentication
    ) {
        String adminId = authentication.getName();
        kycService.approveKYC(adminId, documentId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Reject KYC document (Admin only)
     */
    @PutMapping("/documents/{documentId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject KYC document", description = "Reject a KYC document with reason (Admin only)")
    public ResponseEntity<Void> rejectKYC(
            @PathVariable String documentId,
            @RequestParam String reason,
            Authentication authentication
    ) {
        String adminId = authentication.getName();
        kycService.rejectKYC(adminId, documentId, reason);
        return ResponseEntity.noContent().build();
    }
}
