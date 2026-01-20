package com.creatorx.service.scheduler;

import com.creatorx.common.enums.WithdrawalStatus;
import com.creatorx.repository.WithdrawalRequestRepository;
import com.creatorx.repository.entity.WithdrawalRequest;
import com.creatorx.service.WithdrawalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Scheduled job for processing pending withdrawal payouts
 * Phase 4.2: Automated Payout Scheduler
 *
 * Features:
 * - Processes pending withdrawals in batches
 * - Configurable batch size and interval
 * - Rate limiting to avoid Razorpay API limits
 * - Error handling with individual withdrawal isolation
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PayoutScheduler {

    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final WithdrawalService withdrawalService;

    @Value("${creatorx.payout.scheduler.enabled:true}")
    private boolean schedulerEnabled;

    @Value("${creatorx.payout.scheduler.batch-size:10}")
    private int batchSize;

    // Rate limit: max payouts per minute (Razorpay has API rate limits)
    @Value("${creatorx.payout.scheduler.rate-limit-per-minute:20}")
    private int rateLimitPerMinute;

    private int processedThisMinute = 0;
    private LocalDateTime lastMinuteReset = LocalDateTime.now();

    /**
     * Process pending withdrawals every 5 minutes
     * Cron: 0 *\/5 * * * * (every 5 minutes)
     */
    @Scheduled(cron = "${creatorx.payout.scheduler.cron:0 */5 * * * *}")
    public void processPendingWithdrawals() {
        if (!schedulerEnabled) {
            log.debug("Payout scheduler is disabled");
            return;
        }

        log.info("Starting payout scheduler run");
        long startTime = System.currentTimeMillis();

        try {
            // Reset rate limit counter if minute has passed
            resetRateLimitIfNeeded();

            // Fetch pending withdrawals
            Page<WithdrawalRequest> pendingWithdrawals = withdrawalRequestRepository
                    .findByStatus(WithdrawalStatus.PENDING, PageRequest.of(0, batchSize));

            if (pendingWithdrawals.isEmpty()) {
                log.debug("No pending withdrawals to process");
                return;
            }

            int processed = 0;
            int failed = 0;
            int skipped = 0;

            for (WithdrawalRequest withdrawal : pendingWithdrawals) {
                // Check rate limit
                if (processedThisMinute >= rateLimitPerMinute) {
                    log.warn("Rate limit reached ({} payouts/min), skipping remaining withdrawals",
                            rateLimitPerMinute);
                    skipped = (int) pendingWithdrawals.getTotalElements() - processed - failed;
                    break;
                }

                try {
                    processWithdrawal(withdrawal);
                    processed++;
                    processedThisMinute++;
                } catch (Exception e) {
                    log.error("Failed to process withdrawal {}: {}",
                            withdrawal.getId(), e.getMessage(), e);
                    failed++;
                }
            }

            long duration = System.currentTimeMillis() - startTime;
            log.info("Payout scheduler completed: processed={}, failed={}, skipped={}, duration={}ms",
                    processed, failed, skipped, duration);

        } catch (Exception e) {
            log.error("Payout scheduler failed: {}", e.getMessage(), e);
        }
    }

    /**
     * Process a single withdrawal
     */
    private void processWithdrawal(WithdrawalRequest withdrawal) {
        log.info("Processing withdrawal: {} for user: {}, amount: {} INR",
                withdrawal.getId(),
                withdrawal.getUser().getId(),
                withdrawal.getAmount());

        // Call withdrawal service to create Razorpay payout
        withdrawalService.processWithdrawal(withdrawal.getId());
    }

    /**
     * Reset rate limit counter if a minute has passed
     */
    private void resetRateLimitIfNeeded() {
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(lastMinuteReset.plusMinutes(1))) {
            processedThisMinute = 0;
            lastMinuteReset = now;
        }
    }

    /**
     * Manual trigger for processing withdrawals (for admin use)
     * Returns the number of withdrawals processed
     */
    public int triggerManualProcessing(int maxCount) {
        if (maxCount <= 0 || maxCount > 100) {
            maxCount = 10; // Default to 10, max 100
        }

        log.info("Manual payout processing triggered (max: {})", maxCount);

        Page<WithdrawalRequest> pendingWithdrawals = withdrawalRequestRepository
                .findByStatus(WithdrawalStatus.PENDING, PageRequest.of(0, maxCount));

        int processed = 0;
        for (WithdrawalRequest withdrawal : pendingWithdrawals) {
            try {
                processWithdrawal(withdrawal);
                processed++;
            } catch (Exception e) {
                log.error("Manual processing failed for withdrawal {}: {}",
                        withdrawal.getId(), e.getMessage());
            }
        }

        log.info("Manual payout processing completed: {} withdrawals processed", processed);
        return processed;
    }
}
