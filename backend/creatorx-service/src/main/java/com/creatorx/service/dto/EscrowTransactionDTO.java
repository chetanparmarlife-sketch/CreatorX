package com.creatorx.service.dto;

import com.creatorx.common.enums.EscrowTransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Escrow transaction DTO for API responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscrowTransactionDTO {
    private String id;
    private String brandId;
    private String campaignId;
    private String paymentOrderId;
    private EscrowTransactionType type;
    private BigDecimal amount;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private String description;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;

    // Optional enriched data
    private String campaignTitle;
    private String paymentMethod;
}
