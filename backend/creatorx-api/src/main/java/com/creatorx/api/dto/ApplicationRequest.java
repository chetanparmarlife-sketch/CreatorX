package com.creatorx.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ApplicationRequest {
    @NotBlank(message = "Campaign ID is required")
    private String campaignId;
    
    @NotBlank(message = "Pitch text is required")
    @Size(min = 50, max = 1000, message = "Pitch text must be between 50 and 1000 characters")
    private String pitchText;
    
    @Size(max = 255, message = "Availability must not exceed 255 characters")
    private String availability;
}

