package com.creatorx.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StorageUploadRequest {
    @NotBlank(message = "File type is required")
    private String type; // avatar, kyc, deliverable, portfolio
    
    private String folder; // Optional folder path
    private String documentType; // For KYC documents
    private String deliverableId; // For deliverables
}

