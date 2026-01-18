package com.creatorx.api.controller;

import com.creatorx.common.enums.TransactionType;
import com.creatorx.common.enums.WithdrawalStatus;
import com.creatorx.repository.WebhookEventRepository;
import com.creatorx.repository.WithdrawalRequestRepository;
import com.creatorx.repository.entity.WebhookEvent;
import com.creatorx.repository.entity.WithdrawalRequest;
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
import java.time.LocalDateTime;
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
    private final WalletService walletService;
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
                case "payout.processed":
                    handlePayoutProcessed(event);
                    break;
                case "payout.failed":
                    handlePayoutFailed(event);
                    break;
                case "payout.reversed":
                    handlePayoutReversed(event);
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
