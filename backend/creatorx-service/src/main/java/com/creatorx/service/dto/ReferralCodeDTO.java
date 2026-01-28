package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for referral code response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferralCodeDTO {
    private String code;
    private String createdAt;
}
