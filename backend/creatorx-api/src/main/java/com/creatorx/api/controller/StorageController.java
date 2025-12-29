package com.creatorx.api.controller;

import com.creatorx.api.dto.StorageUploadRequest;
import com.creatorx.common.enums.UserRole;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.FileUploadResponse;
import com.creatorx.service.dto.SignedUrlResponse;
import com.creatorx.service.storage.FileValidationService;
import com.creatorx.service.storage.SupabaseStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
@RequestMapping("/api/v1/storage")
@Tag(name = "Storage", description = "File upload and storage management")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class StorageController {
    
    private final SupabaseStorageService storageService;
    private final FileValidationService fileValidationService;
    
    /**
     * Upload file
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload file", description = "Upload file to Supabase Storage")
    public ResponseEntity<FileUploadResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type,
            @RequestParam(value = "folder", required = false) String folder
    ) {
        User currentUser = getCurrentUser();
        
        FileValidationService.FileCategory category = determineCategory(type);
        String bucket = getBucketForType(type);
        
        FileUploadResponse response = storageService.uploadFile(file, bucket, folder, category);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Upload profile avatar
     */
    @PostMapping(value = "/upload/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload avatar", description = "Upload user profile avatar")
    public ResponseEntity<FileUploadResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file
    ) {
        User currentUser = getCurrentUser();
        FileUploadResponse response = storageService.uploadProfileAvatar(currentUser.getId(), file);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Upload KYC document
     */
    @PostMapping(value = "/upload/kyc", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload KYC document", description = "Upload KYC verification document")
    public ResponseEntity<FileUploadResponse> uploadKYCDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType
    ) {
        User currentUser = getCurrentUser();
        FileUploadResponse response = storageService.uploadKYCDocument(
                currentUser.getId(), documentType, file
        );
        return ResponseEntity.ok(response);
    }
    
    /**
     * Upload deliverable
     */
    @PostMapping(value = "/upload/deliverable", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CREATOR')")
    @Operation(summary = "Upload deliverable", description = "Upload campaign deliverable (Creator only)")
    public ResponseEntity<FileUploadResponse> uploadDeliverable(
            @RequestParam("file") MultipartFile file,
            @RequestParam("deliverableId") String deliverableId
    ) {
        FileUploadResponse response = storageService.uploadDeliverable(deliverableId, file);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Upload portfolio item
     */
    @PostMapping(value = "/upload/portfolio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CREATOR')")
    @Operation(summary = "Upload portfolio item", description = "Upload portfolio item (Creator only)")
    public ResponseEntity<FileUploadResponse> uploadPortfolioItem(
            @RequestParam("file") MultipartFile file
    ) {
        User currentUser = getCurrentUser();
        FileUploadResponse response = storageService.uploadPortfolioItem(currentUser.getId(), file);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete file
     */
    @DeleteMapping("/delete")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete file", description = "Delete file from storage")
    public ResponseEntity<Void> deleteFile(@RequestParam("fileUrl") String fileUrl) {
        User currentUser = getCurrentUser();
        
        // Verify user has permission to delete (check if file belongs to user)
        // This would require checking file metadata in database
        // For now, allow deletion if authenticated
        
        storageService.deleteFile(fileUrl);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Generate signed URL
     */
    @GetMapping("/signed-url")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Generate signed URL", description = "Generate temporary signed URL for file access")
    public ResponseEntity<SignedUrlResponse> generateSignedUrl(
            @RequestParam("fileUrl") String fileUrl,
            @RequestParam(value = "expiresIn", defaultValue = "3600") int expiresInSeconds
    ) {
        SignedUrlResponse response = storageService.generateSignedUrl(fileUrl, expiresInSeconds);
        return ResponseEntity.ok(response);
    }
    
    // Helper methods
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return (User) authentication.getPrincipal();
    }
    
    private FileValidationService.FileCategory determineCategory(String type) {
        return switch (type.toLowerCase()) {
            case "avatar" -> FileValidationService.FileCategory.AVATAR;
            case "kyc", "kyc-document" -> FileValidationService.FileCategory.KYC_DOCUMENT;
            case "deliverable" -> FileValidationService.FileCategory.DELIVERABLE;
            case "portfolio" -> FileValidationService.FileCategory.PORTFOLIO;
            default -> throw new IllegalArgumentException("Invalid file type: " + type);
        };
    }
    
    private String getBucketForType(String type) {
        return switch (type.toLowerCase()) {
            case "avatar" -> "avatars";
            case "kyc", "kyc-document" -> "kyc-documents";
            case "deliverable" -> "deliverables";
            case "portfolio" -> "portfolio";
            default -> throw new IllegalArgumentException("Invalid file type: " + type);
        };
    }
}

