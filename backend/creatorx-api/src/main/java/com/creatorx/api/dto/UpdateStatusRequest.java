package com.creatorx.api.dto;

import com.creatorx.common.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request DTO for updating application status
 */
@Data
public class UpdateStatusRequest {
    @NotNull(message = "Status is required")
    private ApplicationStatus status;
    
    private String reason; // Optional rejection reason
}

