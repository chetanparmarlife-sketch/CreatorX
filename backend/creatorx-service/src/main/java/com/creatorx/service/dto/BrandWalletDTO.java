package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Brand wallet DTO for API responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandWalletDTO {
    private String brandId;

    /**
     * Available balance to allocate to campaigns
     */
    private BigDecimal balance;

    /**
     * Lifetime total deposited via Razorpay
     */
    private BigDecimal totalDeposited;

    /**
     * Total currently allocated to active campaigns
     */
    private BigDecimal totalAllocated;

    /**
     * Total released to creators
     */
    private BigDecimal totalReleased;

    /**
     * Currency (INR)
     */
    private String currency;
}
