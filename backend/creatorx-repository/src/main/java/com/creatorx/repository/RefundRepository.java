package com.creatorx.repository;

import com.creatorx.common.enums.RefundStatus;
import com.creatorx.repository.entity.Refund;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Refund entity
 * Phase 4.2: Razorpay Refund Integration
 */
@Repository
public interface RefundRepository extends JpaRepository<Refund, String> {

    /**
     * Find refund by Razorpay refund ID (for webhook processing)
     */
    Optional<Refund> findByRazorpayRefundId(String razorpayRefundId);

    /**
     * Find refunds by Razorpay payment ID
     */
    List<Refund> findByRazorpayPaymentId(String razorpayPaymentId);

    /**
     * Find refunds by payment order
     */
    @Query("SELECT r FROM Refund r WHERE r.paymentOrder.id = :paymentOrderId ORDER BY r.createdAt DESC")
    List<Refund> findByPaymentOrderId(@Param("paymentOrderId") String paymentOrderId);

    /**
     * Find refunds by status
     */
    Page<Refund> findByStatus(RefundStatus status, Pageable pageable);

    /**
     * Find processed refunds in date range (for reconciliation)
     */
    @Query("SELECT r FROM Refund r WHERE r.status = 'PROCESSED' " +
           "AND r.processedAt >= :startDate AND r.processedAt < :endDate")
    List<Refund> findProcessedRefundsInRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Sum of processed refunds in date range
     */
    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Refund r WHERE r.status = 'PROCESSED' " +
           "AND r.processedAt >= :startDate AND r.processedAt < :endDate")
    BigDecimal sumProcessedRefundsInRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Count processed refunds in date range
     */
    @Query("SELECT COUNT(r) FROM Refund r WHERE r.status = 'PROCESSED' " +
           "AND r.processedAt >= :startDate AND r.processedAt < :endDate")
    Integer countProcessedRefundsInRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Calculate total refunded amount for a payment
     * Used to prevent over-refunding
     */
    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Refund r " +
           "WHERE r.razorpayPaymentId = :razorpayPaymentId " +
           "AND r.status IN ('PENDING', 'PROCESSED')")
    BigDecimal sumRefundedAmountForPayment(@Param("razorpayPaymentId") String razorpayPaymentId);

    /**
     * Check if any refund exists for payment (to prevent duplicate refund requests)
     */
    @Query("SELECT COUNT(r) > 0 FROM Refund r " +
           "WHERE r.paymentOrder.id = :paymentOrderId " +
           "AND r.status IN ('PENDING', 'PROCESSED')")
    boolean existsActiveRefundForPaymentOrder(@Param("paymentOrderId") String paymentOrderId);
}
