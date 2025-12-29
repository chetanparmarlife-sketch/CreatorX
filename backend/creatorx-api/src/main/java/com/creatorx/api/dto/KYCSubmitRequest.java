package com.creatorx.api.dto;

import com.creatorx.common.enums.DocumentType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class KYCSubmitRequest {
    @NotNull(message = "Document type is required")
    private DocumentType documentType;
    
    private String documentNumber; // Aadhaar: 12 digits, PAN: 10 chars
    
    @NotNull(message = "Front image is required")
    private MultipartFile frontImage;
    
    private MultipartFile backImage; // Optional, for AADHAAR
}

