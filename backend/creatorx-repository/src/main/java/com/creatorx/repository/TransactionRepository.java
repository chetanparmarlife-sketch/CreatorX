package com.creatorx.repository;

import com.creatorx.common.enums.TransactionStatus;
import com.creatorx.common.enums.TransactionType;
import com.creatorx.repository.entity.Transaction;
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
}





