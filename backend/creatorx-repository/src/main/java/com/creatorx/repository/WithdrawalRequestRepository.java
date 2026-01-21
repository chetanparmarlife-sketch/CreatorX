package com.creatorx.repository;

import com.creatorx.common.enums.WithdrawalStatus;
import com.creatorx.repository.entity.WithdrawalRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, String> {
    
    @Query("SELECT wr FROM WithdrawalRequest wr WHERE wr.user.id = :userId ORDER BY wr.requestedAt DESC")
    Page<WithdrawalRequest> findByUserId(@Param("userId") String userId, Pageable pageable);
    
    @Query("SELECT wr FROM WithdrawalRequest wr WHERE wr.user.id = :userId AND wr.status = :status ORDER BY wr.requestedAt DESC")
    Page<WithdrawalRequest> findByUserIdAndStatus(
        @Param("userId") String userId,
        @Param("status") WithdrawalStatus status,
        Pageable pageable
    );
    
    @Query("SELECT wr FROM WithdrawalRequest wr WHERE wr.status = :status ORDER BY wr.requestedAt ASC")
    Page<WithdrawalRequest> findByStatus(@Param("status") WithdrawalStatus status, Pageable pageable);

    /**
     * Find withdrawal by Razorpay payout ID (for webhook processing)
     * Phase 4: Real Money Payouts
     */
    @Query("SELECT wr FROM WithdrawalRequest wr WHERE wr.razorpayPayoutId = :razorpayPayoutId")
    java.util.Optional<WithdrawalRequest> findByRazorpayPayoutId(@Param("razorpayPayoutId") String razorpayPayoutId);

    /**
     * Find withdrawals by user after a certain date
     * Phase 4.1: Used for monthly withdrawal limit calculation
     */
    @Query("SELECT wr FROM WithdrawalRequest wr WHERE wr.user.id = :userId AND wr.requestedAt >= :since")
    List<WithdrawalRequest> findByUserIdAndRequestedAtAfter(
            @Param("userId") String userId,
            @Param("since") LocalDateTime since
    );
}

