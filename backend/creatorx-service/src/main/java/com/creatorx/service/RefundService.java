package com.creatorx.service;

import com.creatorx.common.enums.PaymentOrderStatus;
import com.creatorx.common.enums.RefundStatus;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.PaymentOrderRepository;
import com.creatorx.repository.RefundRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.PaymentOrder;
import com.creatorx.repository.entity.Refund;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.RefundDTO;
import com.creatorx.service.mapper.RefundMapper;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for handling Razorpay refunds
 * Phase 4.2: Razorpay Refund Integration
 *
 * Features:
 * - Full and partial refunds
 * - Double-refund prevention
 * - Webhook-based status updates
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RefundService {

    private final RefundRepository refundRepository;
    private final PaymentOrderRepository paymentOrderRepository;
    private final UserRepository userRepository;
    private final Optional<RazorpayClient> razorpayClient;
    private final Optional<RefundMapper> refundMapper;

    // Razorpay uses paise (100 paise = 1 INR)
    private static final int PAISE_PER_RUPEE = 100;

    /**
     * Initiate a refund for a captured payment
     *
     * @param paymentOrderId Payment order ID
     * @param amount Amount to refund (null for full refund)
     * @param reason Reason for refund
     * @param initiatedById User ID of the person initiating refund
     * @return RefundDTO with refund details
     */
    @Transactional
    public RefundDTO initiateRefund(String paymentOrderId, BigDecimal amount,
                                     String reason, String initiatedById) {
        // Validate payment order exists
        PaymentOrder paymentOrder = paymentOrderRepository.findById(paymentOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentOrder", paymentOrderId));

        // Only captured payments can be refunded
        if (paymentOrder.getStatus() != PaymentOrderStatus.CAPTURED) {
            throw new BusinessException("Only captured payments can be refunded. Current status: " +
                    paymentOrder.getStatus());
        }

        // Check if payment has a Razorpay payment ID
        if (paymentOrder.getRazorpayPaymentId() == null) {
            throw new BusinessException("Payment order has no Razorpay payment ID");
        }

        // Prevent double refund
        if (refundRepository.existsActiveRefundForPaymentOrder(paymentOrderId)) {
            throw new BusinessException("A refund is already pending or processed for this payment");
        }

        // Validate refund amount
        BigDecimal refundAmount = amount != null ? amount : paymentOrder.getAmount();
        validateRefundAmount(paymentOrder.getRazorpayPaymentId(), refundAmount, paymentOrder.getAmount());

        // Get initiator user
        User initiatedBy = null;
        if (initiatedById != null) {
            initiatedBy = userRepository.findById(initiatedById).orElse(null);
        }

        // Create refund record
        Refund refund = Refund.builder()
                .paymentOrder(paymentOrder)
                .razorpayPaymentId(paymentOrder.getRazorpayPaymentId())
                .initiatedBy(initiatedBy)
                .amount(refundAmount)
                .currency("INR")
                .status(RefundStatus.CREATED)
                .reason(reason)
                .build();

        refund = refundRepository.save(refund);
        log.info("Refund created: {} for payment order: {}, amount: {} INR",
                refund.getId(), paymentOrderId, refundAmount);

        // Initiate refund with Razorpay
        String razorpayRefundId = createRazorpayRefund(
                paymentOrder.getRazorpayPaymentId(),
                refundAmount,
                refund.getId(),
                reason
        );

        // Update refund with Razorpay ID and set to pending
        refund.setRazorpayRefundId(razorpayRefundId);
        refund.setStatus(RefundStatus.PENDING);
        refundRepository.save(refund);

        log.info("Razorpay refund initiated: {} for refund: {}", razorpayRefundId, refund.getId());

        return refundMapper.map(mapper -> mapper.toDTO(refund))
                .orElseThrow(() -> new BusinessException("RefundMapper not available"));
    }

    /**
     * Create refund via Razorpay API
     */
    private String createRazorpayRefund(String razorpayPaymentId, BigDecimal amount,
                                         String refundId, String reason) {
        if (razorpayClient.isEmpty()) {
            throw new BusinessException("Razorpay is not configured");
        }

        try {
            int amountInPaise = amount.multiply(BigDecimal.valueOf(PAISE_PER_RUPEE)).intValue();

            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", amountInPaise);
            refundRequest.put("speed", "normal"); // normal or optimum
            refundRequest.put("notes", new JSONObject()
                    .put("platform", "CreatorX")
                    .put("refund_id", refundId)
                    .put("reason", reason != null ? reason : "")
            );

            // Razorpay Refund API: POST /payments/{paymentId}/refund
            com.razorpay.Refund razorpayRefund = razorpayClient.get()
                    .payments.refund(razorpayPaymentId, refundRequest);

            return razorpayRefund.get("id");

        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay refund for payment {}: {}",
                    razorpayPaymentId, e.getMessage(), e);
            throw new BusinessException("Failed to initiate refund: " + e.getMessage());
        }
    }

    /**
     * Validate refund amount doesn't exceed payment or already refunded amount
     */
    private void validateRefundAmount(String razorpayPaymentId, BigDecimal requestedAmount,
                                       BigDecimal originalAmount) {
        if (requestedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Refund amount must be greater than zero");
        }

        // Check total already refunded for this payment
        BigDecimal alreadyRefunded = refundRepository.sumRefundedAmountForPayment(razorpayPaymentId);
        BigDecimal remainingRefundable = originalAmount.subtract(alreadyRefunded);

        if (requestedAmount.compareTo(remainingRefundable) > 0) {
            throw new BusinessException(String.format(
                    "Refund amount (₹%.2f) exceeds refundable amount (₹%.2f). " +
                    "Original: ₹%.2f, Already refunded: ₹%.2f",
                    requestedAmount, remainingRefundable, originalAmount, alreadyRefunded));
        }
    }

    /**
     * Process refund status update from webhook
     *
     * @param razorpayRefundId Razorpay refund ID
     * @param isProcessed true if refund processed, false if failed
     * @param failureReason Failure reason (if failed)
     */
    @Transactional
    public void processRefundWebhook(String razorpayRefundId, boolean isProcessed, String failureReason) {
        Optional<Refund> refundOpt = refundRepository.findByRazorpayRefundId(razorpayRefundId);

        if (refundOpt.isEmpty()) {
            log.warn("Refund not found for Razorpay refund ID: {} - may be from another system",
                    razorpayRefundId);
            return;
        }

        Refund refund = refundOpt.get();

        // Idempotency: skip if already in terminal state
        if (refund.getStatus() == RefundStatus.PROCESSED ||
            refund.getStatus() == RefundStatus.FAILED) {
            log.info("Refund {} already in terminal state: {}", refund.getId(), refund.getStatus());
            return;
        }

        if (isProcessed) {
            refund.setStatus(RefundStatus.PROCESSED);
            refund.setProcessedAt(LocalDateTime.now());
            log.info("Refund {} marked as PROCESSED", refund.getId());

            // Update payment order status to REFUNDED
            PaymentOrder paymentOrder = refund.getPaymentOrder();
            if (paymentOrder != null) {
                paymentOrder.setStatus(PaymentOrderStatus.REFUNDED);
                paymentOrderRepository.save(paymentOrder);
                log.info("Payment order {} marked as REFUNDED", paymentOrder.getId());
            }
        } else {
            refund.setStatus(RefundStatus.FAILED);
            refund.setFailureReason(failureReason);
            log.warn("Refund {} marked as FAILED: {}", refund.getId(), failureReason);
        }

        refund.setWebhookReceivedAt(LocalDateTime.now());
        refundRepository.save(refund);
    }

    /**
     * Get refund by ID
     */
    @Transactional(readOnly = true)
    public RefundDTO getRefund(String refundId) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new ResourceNotFoundException("Refund", refundId));

        return refundMapper.map(mapper -> mapper.toDTO(refund))
                .orElseThrow(() -> new BusinessException("RefundMapper not available"));
    }
}
