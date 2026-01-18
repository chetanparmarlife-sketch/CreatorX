package com.creatorx.repository;

import com.creatorx.repository.entity.IdempotencyKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository for IdempotencyKey entity
 * Purpose: Manage idempotency keys for API request deduplication
 * Phase: Phase 4 - Real Money Payouts
 */
@Repository
public interface IdempotencyKeyRepository extends JpaRepository<IdempotencyKey, String> {

    /**
     * Find idempotency key by key value
     * @param key Unique idempotency key from request header
     * @return IdempotencyKey if found
     */
    Optional<IdempotencyKey> findByKey(String key);

    /**
     * Check if idempotency key exists and is not expired
     * @param key Unique idempotency key
     * @param now Current timestamp
     * @return true if key exists and not expired
     */
    @Query("SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END " +
           "FROM IdempotencyKey i " +
           "WHERE i.key = :key AND i.expiresAt > :now")
    boolean existsByKeyAndNotExpired(@Param("key") String key, @Param("now") LocalDateTime now);

    /**
     * Find idempotency key if not expired
     * @param key Unique idempotency key
     * @param now Current timestamp
     * @return IdempotencyKey if found and not expired
     */
    @Query("SELECT i FROM IdempotencyKey i " +
           "WHERE i.key = :key AND i.expiresAt > :now")
    Optional<IdempotencyKey> findByKeyAndNotExpired(@Param("key") String key, @Param("now") LocalDateTime now);

    /**
     * Delete expired idempotency keys
     * Should be called periodically by a scheduled job
     * @param now Current timestamp
     * @return Number of deleted records
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM IdempotencyKey i WHERE i.expiresAt < :now")
    int deleteExpiredKeys(@Param("now") LocalDateTime now);

    /**
     * Count expired idempotency keys
     * Useful for monitoring cleanup job effectiveness
     * @param now Current timestamp
     * @return Number of expired keys
     */
    @Query("SELECT COUNT(i) FROM IdempotencyKey i WHERE i.expiresAt < :now")
    long countExpiredKeys(@Param("now") LocalDateTime now);
}
