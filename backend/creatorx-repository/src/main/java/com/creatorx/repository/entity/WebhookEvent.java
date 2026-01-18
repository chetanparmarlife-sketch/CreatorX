package com.creatorx.repository.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Entity for storing Razorpay webhook events
 * Purpose: Idempotent webhook processing and audit trail
 * Phase: Phase 4 - Real Money Payouts
 */
@Entity
@Table(name = "webhook_events",
       uniqueConstraints = @UniqueConstraint(name = "uk_webhook_events_webhook_id", columnNames = "webhook_id"),
       indexes = {
           @Index(name = "idx_webhook_events_webhook_id", columnList = "webhook_id"),
           @Index(name = "idx_webhook_events_event_type", columnList = "event_type"),
           @Index(name = "idx_webhook_events_created_at", columnList = "created_at")
       })
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class WebhookEvent extends BaseEntity {

    /**
     * Unique identifier from Razorpay webhook (e.g., evt_xxxxx)
     * Used for deduplication
     */
    @Column(name = "webhook_id", nullable = false, unique = true, length = 255)
    private String webhookId;

    /**
     * Type of webhook event (e.g., payout.processed, payout.failed, payout.reversed)
     */
    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    /**
     * Full JSON payload from Razorpay webhook
     * Stored as JSONB for efficient querying and audit trail
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", nullable = false, columnDefinition = "jsonb")
    private String payload;

    /**
     * Timestamp when webhook was successfully processed
     */
    @Column(name = "processed_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime processedAt = LocalDateTime.now();
}
