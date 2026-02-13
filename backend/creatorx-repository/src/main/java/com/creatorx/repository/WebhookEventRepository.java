package com.creatorx.repository;

import com.creatorx.repository.entity.WebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for WebhookEvent entity
 * Purpose: Manage Razorpay webhook events for idempotent processing
 * Phase: Phase 4 - Real Money Payouts
 */
@Repository
public interface WebhookEventRepository extends JpaRepository<WebhookEvent, String> {

    /**
     * Check if webhook event already processed (for deduplication)
     * @param webhookId Unique identifier from Razorpay
     * @return true if webhook already processed
     */
    boolean existsByWebhookId(String webhookId);

    /**
     * Find webhook event by webhook ID
     * @param webhookId Unique identifier from Razorpay
     * @return WebhookEvent if found
     */
    Optional<WebhookEvent> findByWebhookId(String webhookId);

    /**
     * Find all webhook events by event type
     * @param eventType Type of event (e.g., payout.processed)
     * @return List of webhook events
     */
    List<WebhookEvent> findByEventType(String eventType);

    /**
     * Find webhook events created after a certain timestamp
     * Useful for cleanup jobs or audit queries
     * @param after Timestamp to filter from
     * @return List of webhook events
     */
    @Query("SELECT w FROM WebhookEvent w WHERE w.createdAt > :after ORDER BY w.createdAt DESC")
    List<WebhookEvent> findByCreatedAtAfter(@Param("after") LocalDateTime after);

    /**
     * Find failed webhook events eligible for retry
     * @param maxRetries Maximum retry attempts before giving up
     * @return List of failed webhook events
     */
    @Query("SELECT w FROM WebhookEvent w WHERE w.status = 'FAILED' AND w.retryCount < :maxRetries ORDER BY w.createdAt ASC")
    List<WebhookEvent> findFailedForRetry(@Param("maxRetries") int maxRetries);

    /**
     * Delete webhook events older than a certain timestamp
     * Useful for periodic cleanup to save storage
     * @param before Timestamp to delete before
     * @return Number of deleted records
     */
    @Query("DELETE FROM WebhookEvent w WHERE w.createdAt < :before")
    int deleteByCreatedAtBefore(@Param("before") LocalDateTime before);
}
