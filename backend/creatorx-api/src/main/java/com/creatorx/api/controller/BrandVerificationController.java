package com.creatorx.api.controller;

import com.creatorx.repository.entity.User;
import com.creatorx.service.BrandVerificationService;
import com.creatorx.service.dto.BrandVerificationStatusDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/v1/brand-verification")
@RequiredArgsConstructor
@Tag(name = "Brand Verification", description = "Brand verification (GST) endpoints")
@SecurityRequirement(name = "bearerAuth")
public class BrandVerificationController {

    private final BrandVerificationService brandVerificationService;

    @PostMapping(value = "/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Submit GST document", description = "Submit GST document for brand verification")
    public ResponseEntity<BrandVerificationStatusDTO> submitGstDocument(
            @RequestPart("file") MultipartFile file,
            @RequestPart("gstNumber") String gstNumber
    ) {
        User currentUser = getCurrentUser();
        BrandVerificationStatusDTO status = brandVerificationService.submitGstDocument(
                currentUser.getId(),
                gstNumber,
                file
        );
        return ResponseEntity.ok(status);
    }

    @GetMapping("/status")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Get brand verification status", description = "Get latest brand verification status")
    public ResponseEntity<BrandVerificationStatusDTO> getStatus() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(brandVerificationService.getLatestStatus(currentUser.getId()));
    }

    @PostMapping("/review/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Review brand verification", description = "Approve or reject GST verification (Admin only)")
    public ResponseEntity<BrandVerificationStatusDTO> reviewDocument(
            @PathVariable String id,
            @jakarta.validation.Valid @RequestBody com.creatorx.api.dto.BrandVerificationReviewRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                brandVerificationService.reviewDocument(authentication.getName(), id, request.getStatus(), request.getReason())
        );
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List pending brand verifications", description = "List GST documents awaiting review (Admin only)")
    public ResponseEntity<java.util.List<BrandVerificationStatusDTO>> getPending() {
        return ResponseEntity.ok(brandVerificationService.getPendingDocuments());
    }

    @PostMapping("/bulk-review")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk review brand verifications", description = "Approve or reject multiple GST documents")
    public ResponseEntity<Void> bulkReview(
            @RequestBody com.creatorx.api.dto.BrandVerificationBulkReviewRequest request,
            Authentication authentication
    ) {
        brandVerificationService.bulkReview(authentication.getName(), request.getDocumentIds(), request.getStatus(), request.getReason());
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication required");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        log.warn("Authentication principal is not a User instance: {}", principal != null ? principal.getClass() : "null");
        throw new org.springframework.security.access.AccessDeniedException("Invalid authentication principal");
    }
}
