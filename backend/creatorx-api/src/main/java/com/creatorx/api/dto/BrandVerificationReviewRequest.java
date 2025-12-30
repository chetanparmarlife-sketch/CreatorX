package com.creatorx.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BrandVerificationReviewRequest {
    @NotBlank
    private String status;

    private String reason;
}
