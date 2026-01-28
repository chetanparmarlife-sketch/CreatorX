package com.creatorx.repository;

import com.creatorx.common.enums.ReferralStatus;
import com.creatorx.repository.entity.Referral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Referral entity.
 */
@Repository
public interface ReferralRepository extends JpaRepository<Referral, String> {

    /**
     * Find all referrals where user is the referrer
     */
    @Query("SELECT r FROM Referral r WHERE r.referrer.id = :userId ORDER BY r.createdAt DESC")
    List<Referral> findByReferrerId(@Param("userId") String userId);

    /**
     * Find referral where user was referred
     */
    @Query("SELECT r FROM Referral r WHERE r.referee.id = :userId")
    Optional<Referral> findByRefereeId(@Param("userId") String userId);

    /**
     * Count total referrals by referrer
     */
    @Query("SELECT COUNT(r) FROM Referral r WHERE r.referrer.id = :userId")
    long countByReferrerId(@Param("userId") String userId);

    /**
     * Count successful (completed) referrals by referrer
     */
    @Query("SELECT COUNT(r) FROM Referral r WHERE r.referrer.id = :userId AND r.status = :status")
    long countByReferrerIdAndStatus(@Param("userId") String userId, @Param("status") ReferralStatus status);

    /**
     * Sum total earnings from referrals
     */
    @Query("SELECT COALESCE(SUM(r.referrerReward), 0) FROM Referral r WHERE r.referrer.id = :userId AND r.status = 'COMPLETED'")
    BigDecimal sumReferrerRewardsByUserId(@Param("userId") String userId);

    /**
     * Check if user has already been referred
     */
    @Query("SELECT COUNT(r) > 0 FROM Referral r WHERE r.referee.id = :userId")
    boolean existsByRefereeId(@Param("userId") String userId);
}
