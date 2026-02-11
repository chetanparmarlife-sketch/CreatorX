package com.creatorx.repository;

import com.creatorx.repository.entity.BrandWallet;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for brand wallet operations
 */
@Repository
public interface BrandWalletRepository extends JpaRepository<BrandWallet, String> {

    /**
     * Find wallet by brand ID
     */
    @Query("SELECT w FROM BrandWallet w WHERE w.brandId = :brandId")
    Optional<BrandWallet> findByBrandId(@Param("brandId") String brandId);

    /**
     * Find wallet by brand ID with pessimistic write lock
     * Use this for any operation that modifies wallet balance
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM BrandWallet w WHERE w.brandId = :brandId")
    Optional<BrandWallet> findByBrandIdWithLock(@Param("brandId") String brandId);

    /**
     * Check if wallet exists for brand
     */
    boolean existsByBrandId(String brandId);
}
