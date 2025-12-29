package com.creatorx.repository;

import com.creatorx.repository.entity.Wallet;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, String> {
    // Find wallet by user with pessimistic lock for concurrent updates
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.user.id = :userId")
    Optional<Wallet> findByUserIdWithLock(@Param("userId") String userId);
    
    // Find wallet by user (without lock)
    @Query("SELECT w FROM Wallet w WHERE w.user.id = :userId")
    Optional<Wallet> findByUserId(@Param("userId") String userId);
    
    // Atomic balance update operations
    @Modifying
    @Transactional
    @Query("UPDATE Wallet w SET w.balance = w.balance + :amount, w.totalEarned = w.totalEarned + :amount WHERE w.user.id = :userId")
    int addToBalance(@Param("userId") String userId, @Param("amount") BigDecimal amount);
    
    @Modifying
    @Transactional
    @Query("UPDATE Wallet w SET w.balance = w.balance - :amount, w.totalWithdrawn = w.totalWithdrawn + :amount WHERE w.user.id = :userId AND w.balance >= :amount")
    int subtractFromBalance(@Param("userId") String userId, @Param("amount") BigDecimal amount);
    
    @Modifying
    @Transactional
    @Query("UPDATE Wallet w SET w.pendingBalance = w.pendingBalance + :amount WHERE w.user.id = :userId")
    int addToPendingBalance(@Param("userId") String userId, @Param("amount") BigDecimal amount);
    
    @Modifying
    @Transactional
    @Query("UPDATE Wallet w SET w.pendingBalance = w.pendingBalance - :amount, w.balance = w.balance + :amount WHERE w.user.id = :userId AND w.pendingBalance >= :amount")
    int movePendingToBalance(@Param("userId") String userId, @Param("amount") BigDecimal amount);
    
    // Set balance directly (use with caution)
    @Modifying
    @Transactional
    @Query("UPDATE Wallet w SET w.balance = :balance WHERE w.user.id = :userId")
    int setBalance(@Param("userId") String userId, @Param("balance") BigDecimal balance);
}





