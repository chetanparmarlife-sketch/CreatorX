package com.creatorx.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request DTO for creating a payment order
 * Phase 4.2: Brand Payment Collection
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentOrderRequest {

    /**
     * Campaign ID to fund (optional - can be a general deposit)
     */
    private String campaignId;

    /**
     * Amount to deposit in INR
     */
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00", message = "Minimum deposit amount is ₹1.00")
    private BigDecimal amount;
}
