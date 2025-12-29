package com.creatorx.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class DeliverableSubmitRequest {
    @NotBlank(message = "Application ID is required")
    private String applicationId;
    
    @NotBlank(message = "Campaign deliverable ID is required")
    private String campaignDeliverableId;
    
    @NotNull(message = "File is required")
    private MultipartFile file;
    
    @Size(min = 20, max = 500, message = "Description must be between 20 and 500 characters")
    private String description;
}

