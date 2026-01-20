package com.creatorx.repository.entity;

import com.creatorx.common.enums.RefundStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity for tracking Razorpay refunds
 * Phase 4.2: Razorpay Refund Integration
 */
@Entity
@Table(name = "refunds", indexes = {
        @Index(name = "idx_refunds_payment_order_id", columnList = "payment_order_id"),
        @Index(name = "idx_refunds_razorpay_payment_id", columnList = "razorpay_payment_id"),
        @Index(name = "idx_refunds_status", columnList = "status")
})
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"paymentOrder", "initiatedBy"})
public class Refund extends BaseEntity {

    // Razorpay identifiers
    @Column(name = "razorpay_refund_id", unique = true, length = 100)
    private String razorpayRefundId;

    @Column(name = "razorpay_payment_id", nullable = false, length = 100)
    private String razorpayPaymentId;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_order_id")
    private PaymentOrder paymentOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiated_by")
    private User initiatedBy;

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
    private RefundStatus status = RefundStatus.CREATED;

    // Refund details
    @Column(name = "refund_type", length = 50)
    @Builder.Default
    private String refundType = "normal"; // normal, instant

    @Column(length = 50)
    private String speed; // normal, optimum

    // Reason tracking
    @Column(length = 255)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Failure tracking
    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    // Timestamps
    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "webhook_received_at")
    private LocalDateTime webhookReceivedAt;
}
