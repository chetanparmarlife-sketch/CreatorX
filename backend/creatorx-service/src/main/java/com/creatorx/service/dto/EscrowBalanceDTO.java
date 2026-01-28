package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for escrow balance information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscrowBalanceDTO {
    private String brandId;
    private String campaignId;
    private BigDecimal totalDeposited;
    private BigDecimal availableBalance;
    private BigDecimal releasedAmount;
}
