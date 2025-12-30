package com.creatorx.service.storage;

import com.creatorx.common.exception.BusinessException;
import com.creatorx.service.dto.FileUploadResponse;
import com.creatorx.service.dto.SignedUrlResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Supabase Storage Service
 * Handles file uploads, downloads, and signed URL generation
 */
@Slf4j
@Service
public class SupabaseStorageService {
    
    @Value("${supabase.url}")
    private String supabaseUrl;
    
    @Value("${supabase.service.role.key:}")
    private String supabaseServiceRoleKey;
    
    @Value("${supabase.storage.bucket.avatars:avatars}")
    private String avatarsBucket;
    
    @Value("${supabase.storage.bucket.kyc:kyc-documents}")
    private String kycBucket;
    
    @Value("${supabase.storage.bucket.deliverables:deliverables}")
    private String deliverablesBucket;
    
    @Value("${supabase.storage.bucket.portfolio:portfolio}")
    private String portfolioBucket;

    @Value("${supabase.storage.bucket.brand-verification:brand-verification-docs}")
    private String brandVerificationBucket;
    
    private final FileValidationService fileValidationService;
    private final SupabaseStorageClient storageClient;
    
    public SupabaseStorageService(
            FileValidationService fileValidationService,
            SupabaseStorageClient storageClient
    ) {
        this.fileValidationService = fileValidationService;
        this.storageClient = storageClient;
    }
    
    /**
     * Upload file to Supabase Storage
     */
    public FileUploadResponse uploadFile(
            MultipartFile file,
            String bucket,
            String folder,
            FileValidationService.FileCategory category
    ) {
        // Validate file
        fileValidationService.validateFile(file, category);
        
        try {
            // Generate unique file name
            String fileName = generateFileName(file.getOriginalFilename(), file.getContentType());
            String filePath = folder != null ? folder + "/" + fileName : fileName;
            
            // Upload to Supabase Storage
            String fileUrl = uploadToSupabase(file, bucket, filePath);
            
            log.info("File uploaded successfully: {} to bucket: {}", filePath, bucket);
            
            return FileUploadResponse.builder()
                    .fileUrl(fileUrl)
                    .fileName(fileName)
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .bucket(bucket)
                    .path(filePath)
                    .build();
                    
        } catch (IOException e) {
            log.error("Failed to upload file to Supabase", e);
            throw new BusinessException("Failed to upload file: " + e.getMessage());
        }
    }
    
    /**
     * Upload profile avatar
     */
    public FileUploadResponse uploadProfileAvatar(String userId, MultipartFile file) {
        String folder = "users/" + userId;
        return uploadFile(file, avatarsBucket, folder, FileValidationService.FileCategory.AVATAR);
    }
    
    /**
     * Upload KYC document
     */
    public FileUploadResponse uploadKYCDocument(
            String userId,
            String documentType,
            MultipartFile file
    ) {
        String folder = "users/" + userId + "/" + documentType.toLowerCase();
        return uploadFile(file, kycBucket, folder, FileValidationService.FileCategory.KYC_DOCUMENT);
    }
    
    /**
     * Upload deliverable
     */
    public FileUploadResponse uploadDeliverable(String deliverableId, MultipartFile file) {
        String folder = "deliverables/" + deliverableId;
        return uploadFile(file, deliverablesBucket, folder, FileValidationService.FileCategory.DELIVERABLE);
    }
    
    /**
     * Upload portfolio item
     */
    public FileUploadResponse uploadPortfolioItem(String userId, MultipartFile file) {
        String folder = "users/" + userId + "/portfolio";
        return uploadFile(file, portfolioBucket, folder, FileValidationService.FileCategory.PORTFOLIO);
    }

    /**
     * Upload brand verification document (GST)
     */
    public FileUploadResponse uploadBrandVerificationDocument(String brandId, MultipartFile file) {
        String folder = "brands/" + brandId + "/gst";
        return uploadFile(file, brandVerificationBucket, folder, FileValidationService.FileCategory.BRAND_VERIFICATION);
    }
    
    /**
     * Delete file from Supabase Storage
     */
    public void deleteFile(String fileUrl) {
        try {
            // Extract bucket and path from URL
            String[] parts = extractBucketAndPath(fileUrl);
            String bucket = parts[0];
            String path = parts[1];
            
            // Delete from Supabase
            deleteFromSupabase(bucket, path);
            
            log.info("File deleted successfully: {} from bucket: {}", path, bucket);
            
        } catch (Exception e) {
            log.error("Failed to delete file from Supabase", e);
            throw new BusinessException("Failed to delete file: " + e.getMessage());
        }
    }
    
    /**
     * Generate signed URL for temporary access
     */
    public SignedUrlResponse generateSignedUrl(String fileUrl, int expiresInSeconds) {
        try {
            String[] parts = extractBucketAndPath(fileUrl);
            String bucket = parts[0];
            String path = parts[1];
            
            // Generate signed URL from Supabase
            String signedUrl = generateSignedUrlFromSupabase(bucket, path, expiresInSeconds);
            
            LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(expiresInSeconds);
            
            return SignedUrlResponse.builder()
                    .signedUrl(signedUrl)
                    .expiresAt(expiresAt)
                    .fileUrl(fileUrl)
                    .build();
                    
        } catch (Exception e) {
            log.error("Failed to generate signed URL", e);
            throw new BusinessException("Failed to generate signed URL: " + e.getMessage());
        }
    }
    
    // Private helper methods
    
    /**
     * Generate unique file name
     */
    private String generateFileName(String originalFilename, String contentType) {
        String extension = fileValidationService.getFileExtension(contentType);
        if (extension.isEmpty() && originalFilename != null) {
            // Try to extract extension from original filename
            int lastDot = originalFilename.lastIndexOf('.');
            if (lastDot > 0) {
                extension = originalFilename.substring(lastDot + 1);
            }
        }
        
        String uuid = UUID.randomUUID().toString();
        return extension.isEmpty() ? uuid : uuid + "." + extension;
    }
    
    /**
     * Upload file to Supabase Storage
     */
    private String uploadToSupabase(MultipartFile file, String bucket, String path) throws IOException {
        try {
            String fileUrl = storageClient.uploadFile(
                    file.getInputStream(),
                    bucket,
                    path,
                    file.getContentType(),
                    file.getSize()
            ).block(); // Block for synchronous operation
            
            if (fileUrl == null) {
                throw new IOException("Upload returned null URL");
            }
            
            return fileUrl;
        } catch (Exception e) {
            throw new IOException("Failed to upload file to Supabase: " + e.getMessage(), e);
        }
    }
    
    /**
     * Delete file from Supabase Storage
     */
    private void deleteFromSupabase(String bucket, String path) {
        try {
            storageClient.deleteFile(bucket, path).block(); // Block for synchronous operation
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file from Supabase: " + e.getMessage(), e);
        }
    }
    
    /**
     * Generate signed URL from Supabase
     */
    private String generateSignedUrlFromSupabase(String bucket, String path, int expiresIn) {
        try {
            String signedUrl = storageClient.generateSignedUrl(bucket, path, expiresIn)
                    .block(); // Block for synchronous operation
            
            if (signedUrl == null) {
                throw new RuntimeException("Signed URL generation returned null");
            }
            
            return signedUrl;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate signed URL: " + e.getMessage(), e);
        }
    }
    
    /**
     * Extract bucket and path from file URL
     */
    private String[] extractBucketAndPath(String fileUrl) {
        // Parse Supabase Storage URL format:
        // https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
        // or
        // https://{project}.supabase.co/storage/v1/object/{bucket}/{path}
        
        String[] parts = fileUrl.split("/storage/v1/object/");
        if (parts.length < 2) {
            throw new BusinessException("Invalid file URL format");
        }
        
        String pathPart = parts[1];
        if (pathPart.startsWith("public/")) {
            pathPart = pathPart.substring(7); // Remove "public/"
        }
        
        int firstSlash = pathPart.indexOf('/');
        if (firstSlash < 0) {
            throw new BusinessException("Invalid file URL format");
        }
        
        String bucket = pathPart.substring(0, firstSlash);
        String path = pathPart.substring(firstSlash + 1);
        
        return new String[]{bucket, path};
    }
}
