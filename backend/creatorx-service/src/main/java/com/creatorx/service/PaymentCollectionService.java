package com.creatorx.service;

import com.creatorx.common.enums.PaymentOrderStatus;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.PaymentOrderRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.PaymentOrder;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.PaymentOrderDTO;
import com.creatorx.service.mapper.PaymentOrderMapper;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

/**
 * Service for payment collection from brands
 * Phase 4.2: Brand Payment Collection
 *
 * Handles:
 * - Creating Razorpay orders for brand deposits
 * - Verifying payment signatures
 * - Processing payment captures via webhooks
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentCollectionService {

    private final PaymentOrderRepository paymentOrderRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final Optional<RazorpayClient> razorpayClient;
    private final Optional<PaymentOrderMapper> paymentOrderMapper;
    private final EscrowService escrowService;

    // Razorpay uses paise (100 paise = 1 INR)
    private static final int PAISE_PER_RUPEE = 100;

    // Order expiry time (30 minutes)
    private static final int ORDER_EXPIRY_MINUTES = 30;

    /**
     * Create a Razorpay order for brand payment
     *
     * @param brandId        Brand user ID
     * @param campaignId     Campaign ID (optional)
     * @param amount         Amount in INR
     * @param idempotencyKey Unique key for idempotency
     * @return PaymentOrderDTO with Razorpay order details
     */
    @Transactional
    public PaymentOrderDTO createPaymentOrder(String brandId, String campaignId,
            BigDecimal amount, String idempotencyKey) {
        // Validate brand exists
        User brand = userRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("User", brandId));

        // Validate campaign if provided
        Campaign campaign = null;
        if (campaignId != null) {
            campaign = campaignRepository.findById(campaignId)
                    .orElseThrow(() -> new ResourceNotFoundException("Campaign", campaignId));

            // Verify brand owns the campaign
            if (!campaign.getBrand().getId().equals(brandId)) {
                throw new BusinessException("Campaign does not belong to this brand");
            }
        }

        // Validate amount
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Amount must be greater than zero");
        }

        // Check for existing order with same idempotency key
        // This prevents duplicate orders on retry
        Optional<PaymentOrder> existingOrder = paymentOrderRepository.findByIdempotencyKey(idempotencyKey);

        if (existingOrder.isPresent()) {
            log.info("Returning existing payment order for idempotency key: {}", idempotencyKey);
            return paymentOrderMapper.map(mapper -> mapper.toDTO(existingOrder.get()))
                    .orElseThrow(() -> new BusinessException("PaymentOrderMapper not available"));
        }

        // Create Razorpay order
        String razorpayOrderId = createRazorpayOrder(amount, idempotencyKey);

        // Create payment order entity
        PaymentOrder paymentOrder = PaymentOrder.builder()
                .brand(brand)
                .campaign(campaign)
                .amount(amount)
                .currency("INR")
                .status(PaymentOrderStatus.CREATED)
                .razorpayOrderId(razorpayOrderId)
                .idempotencyKey(idempotencyKey)
                .expiresAt(LocalDateTime.now().plusMinutes(ORDER_EXPIRY_MINUTES))
                .notes(Map.of(
                        "brand_id", brandId,
                        "campaign_id", campaignId != null ? campaignId : "",
                        "platform", "CreatorX"))
                .build();

        PaymentOrder savedPaymentOrder = paymentOrderRepository.save(paymentOrder);
        log.info("Payment order created: {} with Razorpay order: {}",
                savedPaymentOrder.getId(), razorpayOrderId);

        return paymentOrderMapper.map(mapper -> mapper.toDTO(savedPaymentOrder))
                .orElseThrow(() -> new BusinessException("PaymentOrderMapper not available"));
    }

    /**
     * Create Razorpay order via API
     */
    private String createRazorpayOrder(BigDecimal amount, String receiptId) {
        if (razorpayClient.isEmpty()) {
            throw new BusinessException("Razorpay is not configured");
        }

        try {
            int amountInPaise = amount.multiply(BigDecimal.valueOf(PAISE_PER_RUPEE)).intValue();

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", receiptId);
            orderRequest.put("notes", new JSONObject()
                    .put("platform", "CreatorX")
                    .put("receipt_id", receiptId));

            Order order = razorpayClient.get().orders.create(orderRequest);
            String orderId = order.get("id");

            log.info("Razorpay order created: {} for amount: {} INR", orderId, amount);
            return orderId;

        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order: {}", e.getMessage(), e);
            throw new BusinessException("Failed to create payment order: " + e.getMessage());
        }
    }

    /**
     * Get payment order by ID
     */
    @Transactional(readOnly = true)
    public PaymentOrderDTO getPaymentOrder(String paymentOrderId) {
        PaymentOrder paymentOrder = paymentOrderRepository.findById(paymentOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentOrder", paymentOrderId));

        return paymentOrderMapper.map(mapper -> mapper.toDTO(paymentOrder))
                .orElseThrow(() -> new BusinessException("PaymentOrderMapper not available"));
    }

    /**
     * Get payment order by Razorpay order ID
     */
    @Transactional(readOnly = true)
    public Optional<PaymentOrder> getByRazorpayOrderId(String razorpayOrderId) {
        return paymentOrderRepository.findByRazorpayOrderId(razorpayOrderId);
    }

    /**
     * Process payment capture (called from webhook)
     */
    @Transactional
    public void processPaymentCapture(String razorpayOrderId, String razorpayPaymentId,
            String paymentMethod, String bank, String vpa) {
        PaymentOrder paymentOrder = paymentOrderRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("PaymentOrder with razorpay_order_id", razorpayOrderId));

        // Idempotency: skip if already captured
        if (paymentOrder.getStatus() == PaymentOrderStatus.CAPTURED) {
            log.info("Payment already captured for order: {}", razorpayOrderId);
            return;
        }

        // Update payment order
        paymentOrder.setRazorpayPaymentId(razorpayPaymentId);
        paymentOrder.setStatus(PaymentOrderStatus.CAPTURED);
        paymentOrder.setCapturedAt(LocalDateTime.now());
        paymentOrder.setWebhookReceivedAt(LocalDateTime.now());
        paymentOrder.setPaymentMethod(paymentMethod);
        paymentOrder.setBank(bank);
        paymentOrder.setVpa(vpa);

        paymentOrderRepository.save(paymentOrder);

        log.info("Payment captured: order={}, payment={}, amount={} INR",
                razorpayOrderId, razorpayPaymentId, paymentOrder.getAmount());

        // Credit escrow wallet for brand deposit
        escrowService.creditBrandDeposit(paymentOrder);
    }

    /**
     * Process payment failure (called from webhook)
     */
    @Transactional
    public void processPaymentFailure(String razorpayOrderId, String razorpayPaymentId,
            String errorCode, String errorDescription) {
        PaymentOrder paymentOrder = paymentOrderRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("PaymentOrder with razorpay_order_id", razorpayOrderId));

        // Idempotency: skip if already failed or captured
        if (paymentOrder.getStatus() == PaymentOrderStatus.FAILED ||
                paymentOrder.getStatus() == PaymentOrderStatus.CAPTURED) {
            log.info("Payment already processed for order: {}", razorpayOrderId);
            return;
        }

        paymentOrder.setRazorpayPaymentId(razorpayPaymentId);
        paymentOrder.setStatus(PaymentOrderStatus.FAILED);
        paymentOrder.setErrorCode(errorCode);
        paymentOrder.setFailureReason(errorDescription);
        paymentOrder.setWebhookReceivedAt(LocalDateTime.now());

        paymentOrderRepository.save(paymentOrder);

        log.warn("Payment failed: order={}, error={}: {}",
                razorpayOrderId, errorCode, errorDescription);
    }

    /**
     * Mark expired orders (called by scheduled job)
     */
    @Transactional
    public int markExpiredOrders() {
        var expiredOrders = paymentOrderRepository.findExpiredOrders(LocalDateTime.now());
        int count = 0;

        for (PaymentOrder order : expiredOrders) {
            order.setStatus(PaymentOrderStatus.EXPIRED);
            paymentOrderRepository.save(order);
            count++;
            log.info("Marked payment order as expired: {}", order.getId());
        }

        if (count > 0) {
            log.info("Marked {} payment orders as expired", count);
        }

        return count;
    }
}
