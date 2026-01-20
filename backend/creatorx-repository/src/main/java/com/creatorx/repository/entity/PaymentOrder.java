package com.creatorx.repository.entity;

import com.creatorx.common.enums.PaymentOrderStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Entity for tracking Razorpay payment orders (brand deposits)
 * Phase 4.2: Brand Payment Collection
 */
@Entity
@Table(name = "payment_orders", indexes = {
        @Index(name = "idx_payment_orders_brand_id", columnList = "brand_id"),
        @Index(name = "idx_payment_orders_campaign_id", columnList = "campaign_id"),
        @Index(name = "idx_payment_orders_status", columnList = "status"),
        @Index(name = "idx_payment_orders_razorpay_order_id", columnList = "razorpay_order_id")
})
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"brand", "campaign"})
public class PaymentOrder extends BaseEntity {

    // Razorpay identifiers
    @Column(name = "razorpay_order_id", unique = true, length = 100)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id", length = 100)
    private String razorpayPaymentId;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private User brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;

    // Amount details
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(length = 3)
    @Builder.Default
    private String currency = "INR";

    // Status tracking
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private PaymentOrderStatus status = PaymentOrderStatus.CREATED;

    // Payment metadata
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(length = 100)
    private String bank;

    @Column(length = 50)
    private String wallet;

    @Column(length = 100)
    private String vpa; // UPI VPA

    // Failure tracking
    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "error_code", length = 50)
    private String errorCode;

    // Timestamps
    @Column(name = "authorized_at")
    private LocalDateTime authorizedAt;

    @Column(name = "captured_at")
    private LocalDateTime capturedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "webhook_received_at")
    private LocalDateTime webhookReceivedAt;

    // Idempotency
    @Column(name = "idempotency_key", length = 100)
    private String idempotencyKey;

    // Notes/metadata
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> notes;
}
