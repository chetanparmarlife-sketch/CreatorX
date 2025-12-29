package com.creatorx.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request DTO for inviting creator to campaign
 */
@Data
public class InviteCreatorRequest {
    @NotBlank(message = "Creator ID is required")
    private String creatorId;
    
    private String message; // Optional invitation message
}

