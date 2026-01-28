package com.creatorx.repository.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

/**
 * Entity for storing tokenized payment methods (cards) for brands.
 * Uses Razorpay tokenization for PCI compliance - stores token, not raw card
 * data.
 */
@Entity
@Table(name = "payment_methods", indexes = {
        @Index(name = "idx_payment_methods_user_id", columnList = "user_id"),
        @Index(name = "idx_payment_methods_default", columnList = "user_id,is_default")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "user" })
@lombok.EqualsAndHashCode(callSuper = true)
public class PaymentMethod extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Razorpay customer ID - used when customer is saved in Razorpay
     */
    @Column(name = "razorpay_customer_id", length = 100)
    private String razorpayCustomerId;

    /**
     * Razorpay token ID - the tokenized card reference
     * This is the secure way to store cards for future payments
     */
    @Column(name = "razorpay_token_id", length = 100)
    private String razorpayTokenId;

    /**
     * Card's last 4 digits (safe to display)
     */
    @Column(name = "card_last4", length = 4)
    private String cardLast4;

    /**
     * Card network: visa, mastercard, amex, rupay, etc.
     */
    @Column(name = "card_network", length = 50)
    private String cardNetwork;

    /**
     * Card type: credit, debit, prepaid
     */
    @Column(name = "card_type", length = 20)
    private String cardType;

    /**
     * Card expiry month (1-12)
     */
    @Column(name = "expiry_month", length = 2)
    private String expiryMonth;

    /**
     * Card expiry year (4 digits)
     */
    @Column(name = "expiry_year", length = 4)
    private String expiryYear;

    /**
     * Cardholder name (as shown on card)
     */
    @Column(name = "cardholder_name")
    private String cardholderName;

    /**
     * Is this the default payment method for the user
     */
    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;

    /**
     * Whether this payment method is active/usable
     */
    @Builder.Default
    private Boolean active = true;
}
