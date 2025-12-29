package com.creatorx.repository;

import com.creatorx.common.enums.WithdrawalStatus;
import com.creatorx.repository.entity.WithdrawalRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
}

