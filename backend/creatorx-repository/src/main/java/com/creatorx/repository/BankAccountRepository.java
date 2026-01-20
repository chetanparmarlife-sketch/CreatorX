package com.creatorx.repository;

import com.creatorx.repository.entity.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, String> {
    
    @Query("SELECT ba FROM BankAccount ba WHERE ba.user.id = :userId ORDER BY ba.isDefault DESC, ba.createdAt ASC")
    List<BankAccount> findByUserId(@Param("userId") String userId);
    
    @Query("SELECT ba FROM BankAccount ba WHERE ba.user.id = :userId AND ba.verified = true ORDER BY ba.isDefault DESC, ba.createdAt ASC")
    List<BankAccount> findVerifiedByUserId(@Param("userId") String userId);
    
    @Query("SELECT ba FROM BankAccount ba WHERE ba.user.id = :userId AND ba.isDefault = true")
    Optional<BankAccount> findDefaultByUserId(@Param("userId") String userId);
    
    @Query("SELECT ba FROM BankAccount ba WHERE ba.id = :id AND ba.user.id = :userId")
    Optional<BankAccount> findByIdAndUserId(@Param("id") String id, @Param("userId") String userId);

    /**
     * Find bank account by Razorpay fund account ID
     * Phase 4.1: Used for fund_account.validation webhook processing
     */
    @Query("SELECT ba FROM BankAccount ba WHERE ba.razorpayFundAccountId = :razorpayFundAccountId")
    Optional<BankAccount> findByRazorpayFundAccountId(@Param("razorpayFundAccountId") String razorpayFundAccountId);
}

