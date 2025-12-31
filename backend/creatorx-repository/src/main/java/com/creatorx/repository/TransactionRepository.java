package com.creatorx.repository;

import com.creatorx.common.enums.TransactionStatus;
import com.creatorx.common.enums.TransactionType;
import com.creatorx.repository.entity.Transaction;
import com.creatorx.repository.projection.FinanceCampaignAggregate;
import com.creatorx.repository.projection.FinancePeriodAggregate;
import com.creatorx.repository.projection.FinanceUserAggregate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    // Find transactions by user with pagination
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId ORDER BY t.createdAt DESC")
    Page<Transaction> findByUserId(@Param("userId") String userId, Pageable pageable);
    
    // Find transactions by type and status
    @Query("SELECT t FROM Transaction t WHERE t.type = :type AND t.status = :status ORDER BY t.createdAt DESC")
    Page<Transaction> findByTypeAndStatus(
        @Param("type") TransactionType type,
        @Param("status") TransactionStatus status,
        Pageable pageable
    );
    
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.status = :status ORDER BY t.createdAt DESC")
    Page<Transaction> findByUserIdAndTypeAndStatus(
        @Param("userId") String userId,
        @Param("type") TransactionType type,
        @Param("status") TransactionStatus status,
        Pageable pageable
    );
    
    // Sum earnings by creator and date range
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE " +
           "t.user.id = :creatorId AND " +
           "t.type = 'EARNING' AND " +
           "t.status = 'COMPLETED' AND " +
           "t.createdAt >= :startDate AND t.createdAt <= :endDate")
    BigDecimal sumEarningsByCreatorAndDateRange(
        @Param("creatorId") String creatorId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    // Sum total earnings for creator
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE " +
           "t.user.id = :creatorId AND " +
           "t.type = 'EARNING' AND " +
           "t.status = 'COMPLETED'")
    BigDecimal sumTotalEarningsByCreator(@Param("creatorId") String creatorId);
    
    // Find transactions by campaign
    @Query("SELECT t FROM Transaction t WHERE t.campaign.id = :campaignId ORDER BY t.createdAt DESC")
    List<Transaction> findByCampaignId(@Param("campaignId") String campaignId);
    
    // Find transactions by application
    @Query("SELECT t FROM Transaction t WHERE t.application.id = :applicationId ORDER BY t.createdAt DESC")
    List<Transaction> findByApplicationId(@Param("applicationId") String applicationId);
    
    // Count transactions by user and type
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type")
    long countByUserIdAndType(@Param("userId") String userId, @Param("type") TransactionType type);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = :type AND t.status = :status")
    BigDecimal sumByTypeAndStatus(
        @Param("type") TransactionType type,
        @Param("status") TransactionStatus status
    );

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE " +
           "t.type = :type AND t.status = :status AND t.createdAt >= :startDate AND t.createdAt <= :endDate")
    BigDecimal sumByTypeAndStatusAndDateRange(
        @Param("type") TransactionType type,
        @Param("status") TransactionStatus status,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT t FROM Transaction t WHERE t.createdAt >= :startDate AND t.createdAt <= :endDate ORDER BY t.createdAt DESC")
    List<Transaction> findByCreatedAtBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT t.user.id as userId, t.user.email as userEmail, COUNT(t) as transactionCount, " +
           "COALESCE(SUM(t.amount), 0) as totalAmount " +
           "FROM Transaction t " +
           "WHERE (:type IS NULL OR t.type = :type) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:from IS NULL OR t.createdAt >= :from) " +
           "AND (:to IS NULL OR t.createdAt <= :to) " +
           "GROUP BY t.user.id, t.user.email " +
           "ORDER BY COALESCE(SUM(t.amount), 0) DESC")
    List<FinanceUserAggregate> aggregateByUser(
            @Param("type") TransactionType type,
            @Param("status") TransactionStatus status,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("SELECT t.campaign.id as campaignId, t.campaign.title as campaignTitle, COUNT(t) as transactionCount, " +
           "COALESCE(SUM(t.amount), 0) as totalAmount " +
           "FROM Transaction t " +
           "WHERE t.campaign IS NOT NULL " +
           "AND (:type IS NULL OR t.type = :type) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:from IS NULL OR t.createdAt >= :from) " +
           "AND (:to IS NULL OR t.createdAt <= :to) " +
           "GROUP BY t.campaign.id, t.campaign.title " +
           "ORDER BY COALESCE(SUM(t.amount), 0) DESC")
    List<FinanceCampaignAggregate> aggregateByCampaign(
            @Param("type") TransactionType type,
            @Param("status") TransactionStatus status,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query(value = "SELECT date_trunc(:period, t.created_at) as period_start, " +
            "COUNT(*) as transaction_count, COALESCE(SUM(t.amount), 0) as total_amount " +
            "FROM transactions t " +
            "WHERE (:type IS NULL OR t.type = :type) " +
            "AND (:status IS NULL OR t.status = :status) " +
            "AND (:from IS NULL OR t.created_at >= :from) " +
            "AND (:to IS NULL OR t.created_at <= :to) " +
            "GROUP BY period_start " +
            "ORDER BY period_start DESC", nativeQuery = true)
    List<FinancePeriodAggregate> aggregateByPeriod(
            @Param("period") String period,
            @Param("type") String type,
            @Param("status") String status,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}


