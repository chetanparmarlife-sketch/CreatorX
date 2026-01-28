package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for PaymentMethod - represents a saved payment method (card) for brands.
 * Only contains safe-to-display information (no raw card data).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodDTO {
    private String id;
    private String cardLast4; // Last 4 digits only
    private String cardNetwork; // visa, mastercard, etc.
    private String cardType; // credit, debit
    private String expiryMonth;
    private String expiryYear;
    private String cardholderName;
    private Boolean isDefault;
    private LocalDateTime createdAt;
}
