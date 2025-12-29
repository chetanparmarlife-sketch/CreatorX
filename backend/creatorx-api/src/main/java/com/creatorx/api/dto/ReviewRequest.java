package com.creatorx.api.dto;

import com.creatorx.common.enums.SubmissionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotNull(message = "Status is required")
    private SubmissionStatus status; // APPROVED, REVISION_REQUESTED, REJECTED
    
    @NotNull(message = "Feedback is required")
    private String feedback;
}

