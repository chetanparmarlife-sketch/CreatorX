package com.creatorx.repository;

import com.creatorx.common.enums.PaymentOrderStatus;
import com.creatorx.repository.entity.PaymentOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for PaymentOrder entity
 * Phase 4.2: Brand Payment Collection
 */
@Repository
public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, String> {

    /**
     * Find payment order by Razorpay order ID (for webhook processing)
     */
    Optional<PaymentOrder> findByRazorpayOrderId(String razorpayOrderId);

    /**
     * Find payment order by Razorpay payment ID (for webhook processing)
     */
    Optional<PaymentOrder> findByRazorpayPaymentId(String razorpayPaymentId);

    /**
     * Find payment orders by campaign
     */
    @Query("SELECT po FROM PaymentOrder po WHERE po.campaign.id = :campaignId ORDER BY po.createdAt DESC")
    Page<PaymentOrder> findByCampaignId(@Param("campaignId") String campaignId, Pageable pageable);

    /**
     * Find payment orders by brand
     */
    @Query("SELECT po FROM PaymentOrder po WHERE po.brand.id = :brandId ORDER BY po.createdAt DESC")
    Page<PaymentOrder> findByBrandId(@Param("brandId") String brandId, Pageable pageable);

    /**
     * Find payment orders by status
     */
    Page<PaymentOrder> findByStatus(PaymentOrderStatus status, Pageable pageable);

    /**
     * Find captured payments in date range (for reconciliation)
     */
    @Query("SELECT po FROM PaymentOrder po WHERE po.status = 'CAPTURED' " +
           "AND po.capturedAt >= :startDate AND po.capturedAt < :endDate")
    List<PaymentOrder> findCapturedPaymentsInRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Sum of captured payments in date range
     */
    @Query("SELECT COALESCE(SUM(po.amount), 0) FROM PaymentOrder po WHERE po.status = 'CAPTURED' " +
           "AND po.capturedAt >= :startDate AND po.capturedAt < :endDate")
    java.math.BigDecimal sumCapturedPaymentsInRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Count captured payments in date range
     */
    @Query("SELECT COUNT(po) FROM PaymentOrder po WHERE po.status = 'CAPTURED' " +
           "AND po.capturedAt >= :startDate AND po.capturedAt < :endDate")
    Integer countCapturedPaymentsInRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Find expired pending orders (for cleanup job)
     */
    @Query("SELECT po FROM PaymentOrder po WHERE po.status = 'CREATED' " +
           "AND po.expiresAt < :now")
    List<PaymentOrder> findExpiredOrders(@Param("now") LocalDateTime now);

    /**
     * Sum of captured payments by brand (for escrow balance)
     */
    @Query("SELECT COALESCE(SUM(po.amount), 0) FROM PaymentOrder po " +
           "WHERE po.brand.id = :brandId AND po.status = 'CAPTURED'")
    java.math.BigDecimal sumCapturedAmountByBrandId(@Param("brandId") String brandId);

    /**
     * Sum of captured payments by campaign (for escrow balance)
     */
    @Query("SELECT COALESCE(SUM(po.amount), 0) FROM PaymentOrder po " +
           "WHERE po.campaign.id = :campaignId AND po.status = 'CAPTURED'")
    java.math.BigDecimal sumCapturedAmountByCampaignId(@Param("campaignId") String campaignId);
}
