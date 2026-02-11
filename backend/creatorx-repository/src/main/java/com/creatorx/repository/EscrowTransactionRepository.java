package com.creatorx.repository;

import com.creatorx.common.enums.EscrowTransactionType;
import com.creatorx.repository.entity.EscrowTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for escrow transaction audit trail
 */
@Repository
public interface EscrowTransactionRepository extends JpaRepository<EscrowTransaction, String> {

    /**
     * Find all transactions for a brand, ordered by creation date descending
     */
    @Query("SELECT et FROM EscrowTransaction et WHERE et.brandId = :brandId ORDER BY et.createdAt DESC")
    Page<EscrowTransaction> findByBrandIdOrderByCreatedAtDesc(@Param("brandId") String brandId, Pageable pageable);

    /**
     * Find all transactions for a campaign
     */
    @Query("SELECT et FROM EscrowTransaction et WHERE et.campaignId = :campaignId ORDER BY et.createdAt DESC")
    Page<EscrowTransaction> findByCampaignIdOrderByCreatedAtDesc(@Param("campaignId") String campaignId, Pageable pageable);

    /**
     * Find transactions by type for a brand
     */
    @Query("SELECT et FROM EscrowTransaction et WHERE et.brandId = :brandId AND et.type = :type ORDER BY et.createdAt DESC")
    Page<EscrowTransaction> findByBrandIdAndType(@Param("brandId") String brandId,
                                                   @Param("type") EscrowTransactionType type,
                                                   Pageable pageable);

    /**
     * Find recent transactions for a brand
     */
    @Query("SELECT et FROM EscrowTransaction et WHERE et.brandId = :brandId AND et.createdAt >= :since ORDER BY et.createdAt DESC")
    List<EscrowTransaction> findRecentByBrandId(@Param("brandId") String brandId,
                                                 @Param("since") LocalDateTime since);

    /**
     * Find transactions related to a specific payment order
     */
    @Query("SELECT et FROM EscrowTransaction et WHERE et.paymentOrderId = :paymentOrderId")
    List<EscrowTransaction> findByPaymentOrderId(@Param("paymentOrderId") String paymentOrderId);
}
