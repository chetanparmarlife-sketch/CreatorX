package com.creatorx.repository.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * Entity for storing idempotency keys for API request deduplication
 * Purpose: Prevent duplicate API requests (especially withdrawals)
 * Phase: Phase 4 - Real Money Payouts
 */
@Entity
@Table(name = "idempotency_keys",
       uniqueConstraints = @UniqueConstraint(name = "uk_idempotency_keys_key", columnNames = "key"),
       indexes = {
           @Index(name = "idx_idempotency_keys_key", columnList = "key"),
           @Index(name = "idx_idempotency_keys_expires_at", columnList = "expires_at")
       })
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class IdempotencyKey extends BaseEntity {

    /**
     * Unique idempotency key from request header (e.g., Idempotent-Key: uuid)
     * Used to identify duplicate requests
     */
    @Column(name = "key", nullable = false, unique = true, length = 255)
    private String key;

    /**
     * HTTP status code of the cached response
     */
    @Column(name = "response_status_code")
    private Integer responseStatusCode;

    /**
     * Cached response body to return for duplicate requests
     * Stored as TEXT to accommodate large JSON responses
     */
    @Lob
    @Column(name = "response_body", columnDefinition = "TEXT")
    private String responseBody;

    /**
     * Expiration timestamp for the idempotency key
     * Recommended TTL: 24 hours
     * A scheduled job should periodically delete expired keys
     */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /**
     * Content-Type header from the cached response
     * Used to return accurate Content-Type when replaying cached responses
     */
    @Column(name = "content_type", length = 255)
    private String contentType;
}
