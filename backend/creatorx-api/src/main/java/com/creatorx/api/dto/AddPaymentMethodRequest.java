package com.creatorx.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for adding a payment method.
 * Accepts Razorpay tokenized card details (NOT raw card numbers).
 */
@Data
public class AddPaymentMethodRequest {

    /**
     * Razorpay customer ID (optional - created during checkout)
     */
    @Size(max = 100, message = "Customer ID must not exceed 100 characters")
    private String razorpayCustomerId;

    /**
     * Razorpay token ID (from tokenized card)
     * This is required for actual Razorpay integration
     */
    @Size(max = 100, message = "Token ID must not exceed 100 characters")
    private String razorpayTokenId;

    /**
     * Last 4 digits of card (for display)
     */
    @NotBlank(message = "Card last 4 digits are required")
    @Size(min = 4, max = 4, message = "Card last 4 must be exactly 4 digits")
    @Pattern(regexp = "^[0-9]{4}$", message = "Card last 4 must be 4 digits")
    private String cardLast4;

    /**
     * Card network: visa, mastercard, amex, rupay, etc.
     */
    @Size(max = 50, message = "Card network must not exceed 50 characters")
    private String cardNetwork;

    /**
     * Card type: credit, debit, prepaid
     */
    @Size(max = 20, message = "Card type must not exceed 20 characters")
    private String cardType;

    /**
     * Expiry month (1-12)
     */
    @Size(min = 1, max = 2, message = "Expiry month must be 1-2 digits")
    @Pattern(regexp = "^(0?[1-9]|1[0-2])$", message = "Expiry month must be 1-12")
    private String expiryMonth;

    /**
     * Expiry year (4 digits)
     */
    @Size(min = 4, max = 4, message = "Expiry year must be 4 digits")
    @Pattern(regexp = "^20[0-9]{2}$", message = "Expiry year must be a valid year (20XX)")
    private String expiryYear;

    /**
     * Cardholder name
     */
    @Size(max = 255, message = "Cardholder name must not exceed 255 characters")
    private String cardholderName;
}
