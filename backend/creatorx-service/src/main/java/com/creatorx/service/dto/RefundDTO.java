package com.creatorx.service.dto;

import com.creatorx.common.enums.RefundStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for Refund
 * Phase 4.2: Razorpay Refund Integration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundDTO {
    private String id;
    private String razorpayRefundId;
    private String razorpayPaymentId;
    private String paymentOrderId;
    private String initiatedById;
    private String initiatedByName;
    private BigDecimal amount;
    private String currency;
    private RefundStatus status;
    private String refundType;
    private String speed;
    private String reason;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
}
