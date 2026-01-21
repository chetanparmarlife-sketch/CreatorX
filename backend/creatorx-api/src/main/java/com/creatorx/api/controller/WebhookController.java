package com.creatorx.api.controller;

import com.creatorx.common.enums.TransactionType;
import com.creatorx.common.enums.WithdrawalStatus;
import com.creatorx.repository.BankAccountRepository;
import com.creatorx.repository.WebhookEventRepository;
import com.creatorx.repository.WithdrawalRequestRepository;
import com.creatorx.repository.entity.BankAccount;
import com.creatorx.repository.entity.WebhookEvent;
import com.creatorx.repository.entity.WithdrawalRequest;
import com.creatorx.service.PaymentCollectionService;
import com.creatorx.service.RefundService;
import com.creatorx.service.WalletService;
import com.creatorx.service.razorpay.RazorpayWebhookVerifier;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Controller for handling Razorpay webhook events
 * Purpose: Process payout status updates from Razorpay
 * Phase: Phase 4 - Real Money Payouts
 *
 * Security: HMAC signature verification (no JWT required)
 * Idempotency: Webhook deduplication via webhook_events table
 * State Machine: Only valid transitions are processed
 * Refund Safety: refundedAt field prevents double refunds
 */
@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Webhooks", description = "Razorpay webhook handlers")
public class WebhookController {

    private final RazorpayWebhookVerifier webhookVerifier;
    private final WebhookEventRepository webhookEventRepository;
    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final BankAccountRepository bankAccountRepository;
    private final WalletService walletService;
    private final PaymentCollectionService paymentCollectionService;
    private final RefundService refundService;
    private final ObjectMapper objectMapper;

    // Valid source states for transitioning to COMPLETED
    private static final Set<WithdrawalStatus> COMPLETABLE_STATES = Set.of(
            WithdrawalStatus.PENDING,
            WithdrawalStatus.PROCESSING
    );

    // Valid source states for transitioning to FAILED (with refund)
    private static final Set<WithdrawalStatus> REFUNDABLE_STATES = Set.of(
            WithdrawalStatus.PENDING,
            WithdrawalStatus.PROCESSING
    );

    // Maximum age for webhooks (1 hour) - reject stale webhooks for security
    private static final long MAX_WEBHOOK_AGE_MINUTES = 60;

    /**
     * Handle Razorpay webhook events
     * Endpoint: POST /api/v1/webhooks/razorpay
     * Security: HMAC signature verification (public endpoint, no JWT)
     */
    @PostMapping("/razorpay")
    @Operation(summary = "Handle Razorpay webhooks", description = "Process payout status updates from Razorpay")
    @Transactional
    public ResponseEntity<Void> handleRazorpayWebhook(
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature,
            @RequestBody String payload
    ) {
        try {
            log.info("Received Razorpay webhook");

            // 1. Verify HMAC signature - REQUIRED
            if (signature == null || signature.isEmpty()) {
                log.warn("Webhook missing X-Razorpay-Signature header");
                return ResponseEntity.status(401).build();
            }

            if (!webhookVerifier.verify(payload, signature)) {
                log.warn("Webhook signature verification failed");
                return ResponseEntity.status(401).build();
            }

            // 2. Parse webhook event
            JsonNode event = objectMapper.readTree(payload);
            String webhookId = getTextOrNull(event, "id");
            String eventType = getTextOrNull(event, "event");

            if (webhookId == null || eventType == null) {
                log.warn("Invalid webhook payload: missing id or event type");
                return ResponseEntity.badRequest().build();
            }

            // SECURITY: Validate webhook timestamp to prevent replay attacks with stale webhooks
            Long createdAt = event.has("created_at") ? event.get("created_at").asLong(0) : 0;
            if (createdAt > 0) {
                Instant webhookTime = Instant.ofEpochSecond(createdAt);
                Instant now = Instant.now();
                long ageMinutes = ChronoUnit.MINUTES.between(webhookTime, now);

                if (ageMinutes > MAX_WEBHOOK_AGE_MINUTES) {
                    log.warn("Webhook {} is too old ({} minutes) - rejecting for security", webhookId, ageMinutes);
                    // Return 200 to prevent Razorpay retries - this is a security rejection, not a processing error
                    return ResponseEntity.ok().build();
                }

                if (ageMinutes < -5) { // Allow 5 min clock skew for future timestamps
                    log.warn("Webhook {} has future timestamp ({} minutes in future) - rejecting", webhookId, -ageMinutes);
                    return ResponseEntity.ok().build();
                }
            }

            log.info("Processing webhook: {} (type: {})", webhookId, eventType);

            // 3. Persist webhook event FIRST for idempotency
            // Handle race condition: if unique constraint violation, treat as duplicate
            try {
                WebhookEvent webhookEvent = WebhookEvent.builder()
                        .webhookId(webhookId)
                        .eventType(eventType)
                        .payload(payload)
                        .processedAt(LocalDateTime.now())
                        .build();
                webhookEventRepository.save(webhookEvent);
                log.info("Webhook event stored: {}", webhookId);
            } catch (DataIntegrityViolationException e) {
                // Unique constraint violation = duplicate webhook
                log.info("Webhook {} already processed (constraint violation) - returning 200 OK", webhookId);
                return ResponseEntity.ok().build();
            }

            // 4. Process event based on type
            switch (eventType) {
                // Payout events (creator withdrawals)
                case "payout.processed":
                    handlePayoutProcessed(event);
                    break;
                case "payout.failed":
                    handlePayoutFailed(event);
                    break;
                case "payout.reversed":
                    handlePayoutReversed(event);
                    break;
                // Fund account validation events (bank verification)
                case "fund_account.validation.completed":
                    handleFundAccountValidation(event, true);
                    break;
                case "fund_account.validation.failed":
                    handleFundAccountValidation(event, false);
                    break;
                // Payment events (brand deposits) - Phase 4.2
                case "payment.captured":
                    handlePaymentCaptured(event);
                    break;
                case "payment.failed":
                    handlePaymentFailed(event);
                    break;
                // Refund events - Phase 4.2
                case "refund.processed":
                    handleRefundProcessed(event);
                    break;
                case "refund.failed":
                    handleRefundFailed(event);
                    break;
                default:
                    log.info("Ignoring webhook event type: {}", eventType);
            }

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            log.error("Error processing webhook: {}", e.getMessage(), e);
            // Return 200 to prevent Razorpay retries on permanent failures
            // The webhook is already stored for manual investigation
            return ResponseEntity.ok().build();
        }
    }

    /**
     * Handle payout.processed event
     * Transitions: PENDING/PROCESSING -> COMPLETED
     * Stores UTR and webhook timestamp
     */
    private void handlePayoutProcessed(JsonNode event) {
        JsonNode payoutEntity = event.path("payload").path("payout").path("entity");

        String payoutId = getTextOrNull(payoutEntity, "id");
        String referenceId = getTextOrNull(payoutEntity, "reference_id");
        String utr = getTextOrNull(payoutEntity, "utr");

        if (payoutId == null) {
            log.warn("payout.processed event missing payout ID");
            return;
        }

        log.info("Payout processed: {} (reference: {}, utr: {})", payoutId, referenceId, utr);

        // Find withdrawal: prefer reference_id (withdrawal ID), fallback to razorpayPayoutId
        Optional<WithdrawalRequest> withdrawalOpt = findWithdrawal(referenceId, payoutId);

        if (withdrawalOpt.isEmpty()) {
            log.warn("Withdrawal not found for payout: {} (reference: {}) - may be from another system",
                    payoutId, referenceId);
            return;
        }

        WithdrawalRequest withdrawal = withdrawalOpt.get();
        WithdrawalStatus currentStatus = withdrawal.getStatus();

        // State machine: only transition from PENDING or PROCESSING
        if (!COMPLETABLE_STATES.contains(currentStatus)) {
            log.warn("Withdrawal {} cannot transition to COMPLETED from {} - ignoring",
                    withdrawal.getId(), currentStatus);
            return;
        }

        // If already FAILED, don't resurrect
        if (currentStatus == WithdrawalStatus.FAILED) {
            log.warn("Withdrawal {} is FAILED - ignoring processed event", withdrawal.getId());
            return;
        }

        // Update withdrawal
        withdrawal.setStatus(WithdrawalStatus.COMPLETED);
        withdrawal.setProcessedAt(LocalDateTime.now());
        withdrawal.setWebhookReceivedAt(LocalDateTime.now());
        if (utr != null) {
            withdrawal.setUtr(utr);
        }
        withdrawalRequestRepository.save(withdrawal);

        log.info("Withdrawal {} marked as COMPLETED (utr: {})", withdrawal.getId(), utr);
    }

    /**
     * Handle payout.failed event
     * Transitions: PENDING/PROCESSING -> FAILED
     * Refunds wallet exactly once (tracked via refundedAt)
     */
    private void handlePayoutFailed(JsonNode event) {
        JsonNode payoutEntity = event.path("payload").path("payout").path("entity");

        String payoutId = getTextOrNull(payoutEntity, "id");
        String referenceId = getTextOrNull(payoutEntity, "reference_id");
        String failureReason = getTextOrDefault(payoutEntity, "failure_reason", "Unknown error");

        if (payoutId == null) {
            log.warn("payout.failed event missing payout ID");
            return;
        }

        log.warn("Payout failed: {} (reference: {}, reason: {})", payoutId, referenceId, failureReason);

        // Find withdrawal
        Optional<WithdrawalRequest> withdrawalOpt = findWithdrawal(referenceId, payoutId);

        if (withdrawalOpt.isEmpty()) {
            log.warn("Withdrawal not found for failed payout: {} (reference: {})", payoutId, referenceId);
            return;
        }

        WithdrawalRequest withdrawal = withdrawalOpt.get();
        WithdrawalStatus currentStatus = withdrawal.getStatus();

        // State machine: only process if PENDING or PROCESSING
        if (!REFUNDABLE_STATES.contains(currentStatus)) {
            log.warn("Withdrawal {} cannot transition to FAILED from {} - ignoring",
                    withdrawal.getId(), currentStatus);
            return;
        }

        // If already COMPLETED, don't fail it
        if (currentStatus == WithdrawalStatus.COMPLETED) {
            log.warn("Withdrawal {} is COMPLETED - ignoring failed event", withdrawal.getId());
            return;
        }

        // Refund idempotency: check if already refunded
        if (withdrawal.getRefundedAt() != null) {
            log.warn("Withdrawal {} already refunded at {} - skipping refund, updating status only",
                    withdrawal.getId(), withdrawal.getRefundedAt());
        } else {
            // Process refund
            refundWithdrawal(withdrawal, "Payout failed: " + failureReason, payoutId);
        }

        // Update withdrawal status (even if refund was already done)
        withdrawal.setStatus(WithdrawalStatus.FAILED);
        withdrawal.setFailureReason(failureReason);
        withdrawal.setProcessedAt(LocalDateTime.now());
        withdrawal.setWebhookReceivedAt(LocalDateTime.now());
        withdrawalRequestRepository.save(withdrawal);

        log.info("Withdrawal {} marked as FAILED (reason: {})", withdrawal.getId(), failureReason);
    }

    /**
     * Handle payout.reversed event
     * Transitions: COMPLETED -> FAILED (reversal happens after success)
     * Also handles PENDING/PROCESSING -> FAILED
     * Refunds wallet exactly once (tracked via refundedAt)
     */
    private void handlePayoutReversed(JsonNode event) {
        JsonNode payoutEntity = event.path("payload").path("payout").path("entity");

        String payoutId = getTextOrNull(payoutEntity, "id");
        String referenceId = getTextOrNull(payoutEntity, "reference_id");

        if (payoutId == null) {
            log.warn("payout.reversed event missing payout ID");
            return;
        }

        log.warn("Payout reversed: {} (reference: {})", payoutId, referenceId);

        // Find withdrawal
        Optional<WithdrawalRequest> withdrawalOpt = findWithdrawal(referenceId, payoutId);

        if (withdrawalOpt.isEmpty()) {
            log.warn("Withdrawal not found for reversed payout: {} (reference: {})", payoutId, referenceId);
            return;
        }

        WithdrawalRequest withdrawal = withdrawalOpt.get();
        WithdrawalStatus currentStatus = withdrawal.getStatus();

        // State machine: reversal can happen from COMPLETED (most common) or PENDING/PROCESSING
        // Already FAILED = ignore
        if (currentStatus == WithdrawalStatus.FAILED) {
            log.warn("Withdrawal {} is already FAILED - ignoring reversal", withdrawal.getId());
            return;
        }

        // Refund idempotency: check if already refunded
        if (withdrawal.getRefundedAt() != null) {
            log.warn("Withdrawal {} already refunded at {} - skipping refund, updating status only",
                    withdrawal.getId(), withdrawal.getRefundedAt());
        } else {
            // Process refund
            refundWithdrawal(withdrawal, "Payout reversed by bank", payoutId);
        }

        // Update withdrawal status
        withdrawal.setStatus(WithdrawalStatus.FAILED);
        withdrawal.setFailureReason("Payout reversed by bank");
        withdrawal.setProcessedAt(LocalDateTime.now());
        withdrawal.setWebhookReceivedAt(LocalDateTime.now());
        withdrawalRequestRepository.save(withdrawal);

        log.info("Withdrawal {} marked as FAILED due to reversal", withdrawal.getId());
    }

    /**
     * Handle fund_account.validation.completed and fund_account.validation.failed events
     * Phase 4.1: Proper bank account verification via webhook
     * Updates bank account verification status based on Razorpay's penny drop result
     */
    private void handleFundAccountValidation(JsonNode event, boolean isSuccess) {
        JsonNode fundAccountEntity = event.path("payload").path("fund_account").path("entity");

        String fundAccountId = getTextOrNull(fundAccountEntity, "id");
        if (fundAccountId == null) {
            log.warn("fund_account.validation event missing fund account ID");
            return;
        }

        // Get validation status details for logging
        JsonNode bankAccountDetails = fundAccountEntity.path("bank_account");
        String accountNumber = getTextOrNull(bankAccountDetails, "account_number");

        log.info("Fund account validation {}: {} (account: {}****)",
                isSuccess ? "completed" : "failed",
                fundAccountId,
                accountNumber != null && accountNumber.length() > 4
                        ? accountNumber.substring(0, 4) : "XXXX");

        // Find bank account by Razorpay fund account ID
        Optional<BankAccount> bankAccountOpt = bankAccountRepository.findByRazorpayFundAccountId(fundAccountId);

        if (bankAccountOpt.isEmpty()) {
            log.warn("Bank account not found for fund account ID: {} - may be from another system", fundAccountId);
            return;
        }

        BankAccount bankAccount = bankAccountOpt.get();

        if (isSuccess) {
            bankAccount.setVerified(true);
            bankAccount.setVerificationStatus("active");
            log.info("Bank account {} verified via webhook", bankAccount.getId());
        } else {
            bankAccount.setVerified(false);
            bankAccount.setVerificationStatus("failed");

            // Extract failure reason if available
            String failureReason = getTextOrNull(fundAccountEntity, "failure_reason");
            log.warn("Bank account {} verification failed: {}",
                    bankAccount.getId(), failureReason != null ? failureReason : "Unknown");
        }

        bankAccountRepository.save(bankAccount);
    }

    /**
     * Handle payment.captured event
     * Phase 4.2: Brand Payment Collection
     * Updates payment order status to CAPTURED when brand payment succeeds
     */
    private void handlePaymentCaptured(JsonNode event) {
        JsonNode paymentEntity = event.path("payload").path("payment").path("entity");

        String paymentId = getTextOrNull(paymentEntity, "id");
        String orderId = getTextOrNull(paymentEntity, "order_id");
        String method = getTextOrNull(paymentEntity, "method");
        String bank = getTextOrNull(paymentEntity, "bank");
        String vpa = getTextOrNull(paymentEntity, "vpa");

        if (paymentId == null || orderId == null) {
            log.warn("payment.captured event missing payment ID or order ID");
            return;
        }

        log.info("Payment captured: {} for order: {} (method: {})", paymentId, orderId, method);

        try {
            paymentCollectionService.processPaymentCapture(orderId, paymentId, method, bank, vpa);
        } catch (Exception e) {
            log.error("Error processing payment capture for order {}: {}", orderId, e.getMessage(), e);
            // Don't rethrow - webhook is already stored for investigation
        }
    }

    /**
     * Handle payment.failed event
     * Phase 4.2: Brand Payment Collection
     * Updates payment order status to FAILED when brand payment fails
     */
    private void handlePaymentFailed(JsonNode event) {
        JsonNode paymentEntity = event.path("payload").path("payment").path("entity");

        String paymentId = getTextOrNull(paymentEntity, "id");
        String orderId = getTextOrNull(paymentEntity, "order_id");
        String errorCode = getTextOrNull(paymentEntity, "error_code");
        String errorDescription = getTextOrNull(paymentEntity, "error_description");

        if (paymentId == null || orderId == null) {
            log.warn("payment.failed event missing payment ID or order ID");
            return;
        }

        log.warn("Payment failed: {} for order: {} (error: {} - {})",
                paymentId, orderId, errorCode, errorDescription);

        try {
            paymentCollectionService.processPaymentFailure(orderId, paymentId, errorCode, errorDescription);
        } catch (Exception e) {
            log.error("Error processing payment failure for order {}: {}", orderId, e.getMessage(), e);
            // Don't rethrow - webhook is already stored for investigation
        }
    }

    /**
     * Handle refund.processed event
     * Phase 4.2: Razorpay Refund Integration
     * Updates refund status to PROCESSED when refund succeeds
     */
    private void handleRefundProcessed(JsonNode event) {
        JsonNode refundEntity = event.path("payload").path("refund").path("entity");

        String refundId = getTextOrNull(refundEntity, "id");
        String paymentId = getTextOrNull(refundEntity, "payment_id");

        if (refundId == null) {
            log.warn("refund.processed event missing refund ID");
            return;
        }

        log.info("Refund processed: {} for payment: {}", refundId, paymentId);

        try {
            refundService.processRefundWebhook(refundId, true, null);
        } catch (Exception e) {
            log.error("Error processing refund.processed for {}: {}", refundId, e.getMessage(), e);
            // Don't rethrow - webhook is already stored for investigation
        }
    }

    /**
     * Handle refund.failed event
     * Phase 4.2: Razorpay Refund Integration
     * Updates refund status to FAILED when refund fails
     */
    private void handleRefundFailed(JsonNode event) {
        JsonNode refundEntity = event.path("payload").path("refund").path("entity");

        String refundId = getTextOrNull(refundEntity, "id");
        String paymentId = getTextOrNull(refundEntity, "payment_id");
        String failureReason = getTextOrDefault(refundEntity, "failure_reason", "Unknown error");

        if (refundId == null) {
            log.warn("refund.failed event missing refund ID");
            return;
        }

        log.warn("Refund failed: {} for payment: {} (reason: {})", refundId, paymentId, failureReason);

        try {
            refundService.processRefundWebhook(refundId, false, failureReason);
        } catch (Exception e) {
            log.error("Error processing refund.failed for {}: {}", refundId, e.getMessage(), e);
            // Don't rethrow - webhook is already stored for investigation
        }
    }

    /**
     * Find withdrawal by reference_id first (our withdrawal ID), then by razorpayPayoutId
     */
    private Optional<WithdrawalRequest> findWithdrawal(String referenceId, String razorpayPayoutId) {
        // Try reference_id first (this is our withdrawal ID passed to Razorpay)
        if (referenceId != null && !referenceId.isEmpty()) {
            Optional<WithdrawalRequest> byReference = withdrawalRequestRepository.findById(referenceId);
            if (byReference.isPresent()) {
                log.debug("Found withdrawal by reference_id: {}", referenceId);
                return byReference;
            }
        }

        // Fallback to razorpayPayoutId
        if (razorpayPayoutId != null && !razorpayPayoutId.isEmpty()) {
            Optional<WithdrawalRequest> byPayoutId = withdrawalRequestRepository
                    .findByRazorpayPayoutId(razorpayPayoutId);
            if (byPayoutId.isPresent()) {
                log.debug("Found withdrawal by razorpayPayoutId: {}", razorpayPayoutId);
                return byPayoutId;
            }
        }

        return Optional.empty();
    }

    /**
     * Process refund to wallet and mark refundedAt timestamp
     */
    private void refundWithdrawal(WithdrawalRequest withdrawal, String reason, String razorpayPayoutId) {
        BigDecimal amount = withdrawal.getAmount();
        String userId = withdrawal.getUser().getId();

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("reason", reason);
        metadata.put("withdrawalRequestId", withdrawal.getId());
        metadata.put("razorpayPayoutId", razorpayPayoutId);
        metadata.put("originalStatus", withdrawal.getStatus().name());

        walletService.creditWalletWithType(
                userId,
                amount,
                reason,
                null,
                TransactionType.REFUND,
                metadata
        );

        // Mark as refunded for idempotency
        withdrawal.setRefundedAt(LocalDateTime.now());

        log.info("Refunded {} to user {} for withdrawal {}", amount, userId, withdrawal.getId());
    }

    /**
     * Safely get text value from JsonNode or null if missing/empty
     */
    private String getTextOrNull(JsonNode node, String fieldName) {
        JsonNode field = node.get(fieldName);
        if (field == null || field.isNull() || field.isMissingNode()) {
            return null;
        }
        String value = field.asText();
        return value.isEmpty() ? null : value;
    }

    /**
     * Safely get text value from JsonNode with default
     */
    private String getTextOrDefault(JsonNode node, String fieldName, String defaultValue) {
        String value = getTextOrNull(node, fieldName);
        return value != null ? value : defaultValue;
    }
}
