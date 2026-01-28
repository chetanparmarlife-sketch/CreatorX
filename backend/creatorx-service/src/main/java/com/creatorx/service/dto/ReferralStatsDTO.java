package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for referral statistics response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferralStatsDTO {
    private long totalReferrals;
    private long successfulReferrals;
    private BigDecimal totalEarnings;
}
