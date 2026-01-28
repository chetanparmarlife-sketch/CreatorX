package com.creatorx.repository;

import com.creatorx.repository.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for PaymentMethod entity.
 * Manages tokenized payment methods (cards) for brands.
 */
@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, String> {

    /**
     * Find all payment methods for a user, ordered by default first
     */
    @Query("SELECT pm FROM PaymentMethod pm WHERE pm.user.id = :userId AND pm.active = true ORDER BY pm.isDefault DESC, pm.createdAt ASC")
    List<PaymentMethod> findByUserId(@Param("userId") String userId);

    /**
     * Find default payment method for a user
     */
    @Query("SELECT pm FROM PaymentMethod pm WHERE pm.user.id = :userId AND pm.isDefault = true AND pm.active = true")
    Optional<PaymentMethod> findDefaultByUserId(@Param("userId") String userId);

    /**
     * Find payment method by ID and user ID (for ownership verification)
     */
    @Query("SELECT pm FROM PaymentMethod pm WHERE pm.id = :id AND pm.user.id = :userId")
    Optional<PaymentMethod> findByIdAndUserId(@Param("id") String id, @Param("userId") String userId);

    /**
     * Find payment method by Razorpay token ID
     */
    @Query("SELECT pm FROM PaymentMethod pm WHERE pm.razorpayTokenId = :tokenId")
    Optional<PaymentMethod> findByRazorpayTokenId(@Param("tokenId") String tokenId);

    /**
     * Count active payment methods for a user
     */
    @Query("SELECT COUNT(pm) FROM PaymentMethod pm WHERE pm.user.id = :userId AND pm.active = true")
    long countActiveByUserId(@Param("userId") String userId);
}
