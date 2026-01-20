package com.creatorx.service.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.concurrent.TimeUnit;

/**
 * Service for tracking payment-related metrics
 * Phase 4.2: Observability
 *
 * Metrics tracked:
 * - Payment orders created/captured/failed
 * - Payout requests/completions/failures
 * - Refund requests/completions/failures
 * - Webhook processing times and counts
 * - Reconciliation results
 */
@Service
@Slf4j
public class PaymentMetricsService {

    private final MeterRegistry meterRegistry;

    // Payment counters
    private final Counter paymentOrdersCreated;
    private final Counter paymentsCaptured;
    private final Counter paymentsFailed;
    private final Counter paymentsExpired;

    // Payout counters
    private final Counter payoutsRequested;
    private final Counter payoutsProcessed;
    private final Counter payoutsFailed;
    private final Counter payoutsReversed;

    // Refund counters
    private final Counter refundsRequested;
    private final Counter refundsProcessed;
    private final Counter refundsFailed;

    // Webhook counters
    private final Counter webhooksReceived;
    private final Counter webhooksProcessed;
    private final Counter webhooksRejected;

    // Timers
    private final Timer paymentCaptureTimer;
    private final Timer payoutProcessingTimer;
    private final Timer webhookProcessingTimer;

    public PaymentMetricsService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;

        // Initialize payment counters
        this.paymentOrdersCreated = Counter.builder("creatorx.payments.orders.created")
                .description("Number of payment orders created")
                .register(meterRegistry);

        this.paymentsCaptured = Counter.builder("creatorx.payments.captured")
                .description("Number of payments captured")
                .register(meterRegistry);

        this.paymentsFailed = Counter.builder("creatorx.payments.failed")
                .description("Number of payments failed")
                .register(meterRegistry);

        this.paymentsExpired = Counter.builder("creatorx.payments.expired")
                .description("Number of payment orders expired")
                .register(meterRegistry);

        // Initialize payout counters
        this.payoutsRequested = Counter.builder("creatorx.payouts.requested")
                .description("Number of payout requests")
                .register(meterRegistry);

        this.payoutsProcessed = Counter.builder("creatorx.payouts.processed")
                .description("Number of payouts successfully processed")
                .register(meterRegistry);

        this.payoutsFailed = Counter.builder("creatorx.payouts.failed")
                .description("Number of payouts failed")
                .register(meterRegistry);

        this.payoutsReversed = Counter.builder("creatorx.payouts.reversed")
                .description("Number of payouts reversed")
                .register(meterRegistry);

        // Initialize refund counters
        this.refundsRequested = Counter.builder("creatorx.refunds.requested")
                .description("Number of refund requests")
                .register(meterRegistry);

        this.refundsProcessed = Counter.builder("creatorx.refunds.processed")
                .description("Number of refunds processed")
                .register(meterRegistry);

        this.refundsFailed = Counter.builder("creatorx.refunds.failed")
                .description("Number of refunds failed")
                .register(meterRegistry);

        // Initialize webhook counters
        this.webhooksReceived = Counter.builder("creatorx.webhooks.received")
                .description("Number of webhooks received")
                .register(meterRegistry);

        this.webhooksProcessed = Counter.builder("creatorx.webhooks.processed")
                .description("Number of webhooks successfully processed")
                .register(meterRegistry);

        this.webhooksRejected = Counter.builder("creatorx.webhooks.rejected")
                .description("Number of webhooks rejected (invalid signature, duplicate, etc.)")
                .register(meterRegistry);

        // Initialize timers
        this.paymentCaptureTimer = Timer.builder("creatorx.payments.capture.duration")
                .description("Time taken to capture a payment")
                .register(meterRegistry);

        this.payoutProcessingTimer = Timer.builder("creatorx.payouts.processing.duration")
                .description("Time taken to process a payout")
                .register(meterRegistry);

        this.webhookProcessingTimer = Timer.builder("creatorx.webhooks.processing.duration")
                .description("Time taken to process a webhook")
                .register(meterRegistry);
    }

    // Payment metrics
    public void recordPaymentOrderCreated() {
        paymentOrdersCreated.increment();
    }

    public void recordPaymentCaptured(BigDecimal amount) {
        paymentsCaptured.increment();
        meterRegistry.counter("creatorx.payments.captured.amount")
                .increment(amount.doubleValue());
    }

    public void recordPaymentFailed(String errorCode) {
        paymentsFailed.increment();
        Counter.builder("creatorx.payments.failed.by_error")
                .tag("error_code", errorCode != null ? errorCode : "unknown")
                .register(meterRegistry)
                .increment();
    }

    public void recordPaymentExpired() {
        paymentsExpired.increment();
    }

    // Payout metrics
    public void recordPayoutRequested(BigDecimal amount) {
        payoutsRequested.increment();
        meterRegistry.counter("creatorx.payouts.requested.amount")
                .increment(amount.doubleValue());
    }

    public void recordPayoutProcessed(BigDecimal amount) {
        payoutsProcessed.increment();
        meterRegistry.counter("creatorx.payouts.processed.amount")
                .increment(amount.doubleValue());
    }

    public void recordPayoutFailed(String reason) {
        payoutsFailed.increment();
        Counter.builder("creatorx.payouts.failed.by_reason")
                .tag("reason", categorizeFailureReason(reason))
                .register(meterRegistry)
                .increment();
    }

    public void recordPayoutReversed(BigDecimal amount) {
        payoutsReversed.increment();
        meterRegistry.counter("creatorx.payouts.reversed.amount")
                .increment(amount.doubleValue());
    }

    // Refund metrics
    public void recordRefundRequested(BigDecimal amount) {
        refundsRequested.increment();
        meterRegistry.counter("creatorx.refunds.requested.amount")
                .increment(amount.doubleValue());
    }

    public void recordRefundProcessed(BigDecimal amount) {
        refundsProcessed.increment();
        meterRegistry.counter("creatorx.refunds.processed.amount")
                .increment(amount.doubleValue());
    }

    public void recordRefundFailed(String reason) {
        refundsFailed.increment();
        Counter.builder("creatorx.refunds.failed.by_reason")
                .tag("reason", categorizeFailureReason(reason))
                .register(meterRegistry)
                .increment();
    }

    // Webhook metrics
    public void recordWebhookReceived(String eventType) {
        webhooksReceived.increment();
        Counter.builder("creatorx.webhooks.received.by_type")
                .tag("event_type", eventType)
                .register(meterRegistry)
                .increment();
    }

    public void recordWebhookProcessed(String eventType) {
        webhooksProcessed.increment();
        Counter.builder("creatorx.webhooks.processed.by_type")
                .tag("event_type", eventType)
                .register(meterRegistry)
                .increment();
    }

    public void recordWebhookRejected(String reason) {
        webhooksRejected.increment();
        Counter.builder("creatorx.webhooks.rejected.by_reason")
                .tag("reason", reason)
                .register(meterRegistry)
                .increment();
    }

    // Timing methods
    public Timer.Sample startPaymentCapture() {
        return Timer.start(meterRegistry);
    }

    public void stopPaymentCapture(Timer.Sample sample) {
        sample.stop(paymentCaptureTimer);
    }

    public Timer.Sample startPayoutProcessing() {
        return Timer.start(meterRegistry);
    }

    public void stopPayoutProcessing(Timer.Sample sample) {
        sample.stop(payoutProcessingTimer);
    }

    public void recordWebhookProcessingTime(long milliseconds) {
        webhookProcessingTimer.record(milliseconds, TimeUnit.MILLISECONDS);
    }

    // Reconciliation metrics
    public void recordReconciliationCompleted(boolean hasDiscrepancy, int mismatchCount) {
        Counter.builder("creatorx.reconciliation.completed")
                .tag("has_discrepancy", String.valueOf(hasDiscrepancy))
                .register(meterRegistry)
                .increment();

        if (hasDiscrepancy) {
            meterRegistry.counter("creatorx.reconciliation.mismatches")
                    .increment(mismatchCount);
        }
    }

    public void recordReconciliationFailed() {
        meterRegistry.counter("creatorx.reconciliation.failed").increment();
    }

    // Helper method to categorize failure reasons
    private String categorizeFailureReason(String reason) {
        if (reason == null || reason.isEmpty()) {
            return "unknown";
        }

        String lowerReason = reason.toLowerCase();
        if (lowerReason.contains("insufficient")) {
            return "insufficient_funds";
        } else if (lowerReason.contains("invalid") || lowerReason.contains("incorrect")) {
            return "invalid_details";
        } else if (lowerReason.contains("timeout") || lowerReason.contains("network")) {
            return "network_error";
        } else if (lowerReason.contains("bank") || lowerReason.contains("imps") || lowerReason.contains("neft")) {
            return "bank_error";
        } else {
            return "other";
        }
    }
}
