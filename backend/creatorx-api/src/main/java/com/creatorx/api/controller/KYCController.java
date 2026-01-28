package com.creatorx.api.controller;

import com.creatorx.api.dto.KYCSubmitRequest;
import com.creatorx.common.enums.DocumentType;
import com.creatorx.common.permissions.AdminPermissions;
import com.creatorx.repository.entity.User;
import com.creatorx.service.KYCService;
import com.creatorx.service.admin.AdminPermissionService;
import com.creatorx.service.dto.KYCDocumentDTO;
import com.creatorx.service.dto.KYCStatusDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private final AdminPermissionService adminPermissionService;

    /**
     * Submit KYC document.
     * Accepts either 'file' (mobile) or 'frontImage' (web) field for the document
     * image.
     */
    @PostMapping(value = "/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Submit KYC document", description = "Upload KYC document for verification")
    public ResponseEntity<KYCDocumentDTO> submitKYC(
            @RequestPart("documentType") String documentTypeStr,
            @RequestPart(value = "documentNumber", required = false) String documentNumber,
            @RequestPart(value = "frontImage", required = false) MultipartFile frontImage,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "backImage", required = false) MultipartFile backImage,
            Authentication authentication) {
        // Use 'file' if provided (mobile), otherwise use 'frontImage' (web)
        MultipartFile documentFile = (file != null && !file.isEmpty()) ? file : frontImage;

        // Validate document file is not empty
        if (documentFile == null || documentFile.isEmpty()) {
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
                documentFile,
                backImage);

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
     * Get a specific KYC document by ID
     */
    @GetMapping("/documents/{documentId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get KYC document", description = "Get a specific KYC document by ID")
    public ResponseEntity<KYCDocumentDTO> getDocument(
            @PathVariable String documentId,
            Authentication authentication) {
        String userId = authentication.getName();
        KYCDocumentDTO document = kycService.getDocument(userId, documentId);
        return ResponseEntity.ok(document);
    }

    /**
     * Resubmit a rejected KYC document
     */
    @PostMapping(value = "/documents/{documentId}/resubmit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Resubmit KYC document", description = "Resubmit a rejected KYC document with a new file")
    public ResponseEntity<KYCDocumentDTO> resubmitDocument(
            @PathVariable String documentId,
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "documentNumber", required = false) String documentNumber,
            Authentication authentication) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        String userId = authentication.getName();
        KYCDocumentDTO document = kycService.resubmitDocument(userId, documentId, file, documentNumber);
        return ResponseEntity.status(HttpStatus.CREATED).body(document);
    }

    /**
     * Get pending KYC documents (Admin only)
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List pending KYC documents", description = "List KYC documents awaiting review (Admin only)")
    public ResponseEntity<Page<KYCDocumentDTO>> getPendingDocuments(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_KYC_REVIEW);
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return ResponseEntity.ok(kycService.getPendingDocuments(pageable));
    }

    /**
     * Bulk review KYC documents (Admin only)
     */
    @PostMapping("/documents/bulk-review")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk review KYC documents", description = "Approve or reject multiple KYC documents")
    public ResponseEntity<Void> bulkReview(
            @RequestBody com.creatorx.api.dto.KycBulkReviewRequest request,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_KYC_REVIEW);
        kycService.bulkReview(authentication.getName(), request.getDocumentIds(), request.getStatus(),
                request.getReason());
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
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_KYC_REVIEW);
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
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_KYC_REVIEW);
        String adminId = authentication.getName();
        kycService.rejectKYC(adminId, documentId, reason);
        return ResponseEntity.noContent().build();
    }
}
