package com.creatorx.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for applying a referral code.
 */
@Data
public class ApplyReferralRequest {

    @NotBlank(message = "Referral code is required")
    @Size(min = 4, max = 20, message = "Referral code must be between 4 and 20 characters")
    private String code;
}
