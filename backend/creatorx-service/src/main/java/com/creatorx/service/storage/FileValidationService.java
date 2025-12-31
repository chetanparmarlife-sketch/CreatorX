package com.creatorx.service.storage;

import com.creatorx.common.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
public class FileValidationService {
    
    // File type constants
    private static final Set<String> IMAGE_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
    );
    
    private static final Set<String> VIDEO_TYPES = Set.of(
            "video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"
    );
    
    private static final Set<String> DOCUMENT_TYPES = Set.of(
            "application/pdf"
    );
    
    // File size limits (in bytes)
    private static final long MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
    private static final long MAX_KYC_SIZE = 10 * 1024 * 1024; // 10MB
    private static final long MAX_DELIVERABLE_SIZE = 100 * 1024 * 1024; // 100MB
    private static final long MAX_PORTFOLIO_SIZE = 100 * 1024 * 1024; // 100MB
    private static final long MAX_BRAND_VERIFICATION_SIZE = 10 * 1024 * 1024; // 10MB
    
    public enum FileCategory {
        AVATAR,
        KYC_DOCUMENT,
        DELIVERABLE,
        PORTFOLIO,
        BRAND_VERIFICATION
    }
    
    /**
     * Validate file for upload
     */
    public void validateFile(MultipartFile file, FileCategory category) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("File is required");
        }
        
        // Check file size
        validateFileSize(file, category);
        
        // Check file type
        validateFileType(file, category);
        
        // Check file name
        validateFileName(file.getOriginalFilename());
    }
    
    /**
     * Validate file size based on category
     */
    private void validateFileSize(MultipartFile file, FileCategory category) {
        long maxSize = switch (category) {
            case AVATAR -> MAX_AVATAR_SIZE;
            case KYC_DOCUMENT -> MAX_KYC_SIZE;
            case DELIVERABLE -> MAX_DELIVERABLE_SIZE;
            case PORTFOLIO -> MAX_PORTFOLIO_SIZE;
            case BRAND_VERIFICATION -> MAX_BRAND_VERIFICATION_SIZE;
        };
        
        if (file.getSize() > maxSize) {
            String maxSizeMB = maxSize / (1024 * 1024) + "MB";
            throw new BusinessException(
                    String.format("File size exceeds maximum allowed size of %s", maxSizeMB)
            );
        }
    }
    
    /**
     * Validate file type based on category
     */
    private void validateFileType(MultipartFile file, FileCategory category) {
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new BusinessException("File type cannot be determined");
        }
        
        boolean isValid = switch (category) {
            case AVATAR -> IMAGE_TYPES.contains(contentType.toLowerCase());
            case KYC_DOCUMENT -> IMAGE_TYPES.contains(contentType.toLowerCase()) || 
                                DOCUMENT_TYPES.contains(contentType.toLowerCase());
            case DELIVERABLE -> IMAGE_TYPES.contains(contentType.toLowerCase()) || 
                               VIDEO_TYPES.contains(contentType.toLowerCase());
            case PORTFOLIO -> IMAGE_TYPES.contains(contentType.toLowerCase()) || 
                             VIDEO_TYPES.contains(contentType.toLowerCase());
            case BRAND_VERIFICATION -> IMAGE_TYPES.contains(contentType.toLowerCase()) ||
                             DOCUMENT_TYPES.contains(contentType.toLowerCase());
        };
        
        if (!isValid) {
            throw new BusinessException(
                    String.format("Invalid file type for %s. Allowed types: %s", 
                            category, getAllowedTypes(category))
            );
        }
    }
    
    /**
     * Validate file name
     */
    private void validateFileName(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            throw new BusinessException("File name is required");
        }
        
        // Check for path traversal attempts
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            throw new BusinessException("Invalid file name");
        }
        
        // Check for dangerous characters
        if (fileName.contains("<") || fileName.contains(">") || fileName.contains("|")) {
            throw new BusinessException("File name contains invalid characters");
        }
        
        // Check length
        if (fileName.length() > 255) {
            throw new BusinessException("File name is too long");
        }
    }
    
    /**
     * Get allowed file types for category
     */
    private String getAllowedTypes(FileCategory category) {
        return switch (category) {
            case AVATAR -> "Images (JPG, PNG, WEBP, GIF)";
            case KYC_DOCUMENT -> "Images (JPG, PNG) or PDF";
            case DELIVERABLE -> "Images (JPG, PNG) or Videos (MP4, MOV)";
            case PORTFOLIO -> "Images (JPG, PNG) or Videos (MP4, MOV)";
            case BRAND_VERIFICATION -> "Images (JPG, PNG) or PDF";
        };
    }
    
    /**
     * Get file extension from content type
     */
    public String getFileExtension(String contentType) {
        if (contentType == null) {
            return "";
        }
        
        return switch (contentType.toLowerCase()) {
            case "image/jpeg", "image/jpg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/gif" -> "gif";
            case "video/mp4" -> "mp4";
            case "video/quicktime" -> "mov";
            case "video/x-msvideo" -> "avi";
            case "video/webm" -> "webm";
            case "application/pdf" -> "pdf";
            default -> "";
        };
    }
    
    /**
     * Check if file is an image
     */
    public boolean isImage(String contentType) {
        return contentType != null && IMAGE_TYPES.contains(contentType.toLowerCase());
    }
    
    /**
     * Check if file is a video
     */
    public boolean isVideo(String contentType) {
        return contentType != null && VIDEO_TYPES.contains(contentType.toLowerCase());
    }
    
    /**
     * Check if file is a document
     */
    public boolean isDocument(String contentType) {
        return contentType != null && DOCUMENT_TYPES.contains(contentType.toLowerCase());
    }
    
    /**
     * Validate image dimensions (optional, for avatars)
     * Note: This requires image processing library like ImageIO or BufferedImage
     * For now, we'll skip dimension validation as it requires additional dependencies
     */
    public void validateImageDimensions(MultipartFile file, int minWidth, int minHeight) {
        // TODO: Implement image dimension validation if needed
        // This would require reading the image file and checking dimensions
        // For now, we skip this validation
    }
}
