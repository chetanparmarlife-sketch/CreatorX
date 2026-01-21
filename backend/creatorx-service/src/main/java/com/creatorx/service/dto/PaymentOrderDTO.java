package com.creatorx.service.dto;

import com.creatorx.common.enums.PaymentOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for PaymentOrder
 * Phase 4.2: Brand Payment Collection
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderDTO {
    private String id;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String brandId;
    private String brandName;
    private String campaignId;
    private String campaignTitle;
    private BigDecimal amount;
    private String currency;
    private PaymentOrderStatus status;
    private String paymentMethod;
    private String bank;
    private String wallet;
    private String vpa;
    private String failureReason;
    private String errorCode;
    private LocalDateTime createdAt;
    private LocalDateTime authorizedAt;
    private LocalDateTime capturedAt;
    private LocalDateTime expiresAt;
}
