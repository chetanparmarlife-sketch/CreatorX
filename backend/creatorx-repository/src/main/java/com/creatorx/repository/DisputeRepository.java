package com.creatorx.repository;

import com.creatorx.common.enums.DisputeStatus;
import com.creatorx.repository.entity.Dispute;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, String>, JpaSpecificationExecutor<Dispute> {
        @Query("SELECT d FROM Dispute d WHERE d.creator.id = :userId OR d.brand.id = :userId ORDER BY d.createdAt DESC")
        Page<Dispute> findByUserId(@Param("userId") String userId, Pageable pageable);

        @Query("SELECT d FROM Dispute d WHERE d.status = :status ORDER BY d.createdAt DESC")
        Page<Dispute> findByStatus(@Param("status") DisputeStatus status, Pageable pageable);

        @Query("SELECT COUNT(d) FROM Dispute d WHERE d.brand.id = :brandId AND d.status = :status")
        long countByBrandIdAndStatus(@Param("brandId") String brandId, @Param("status") DisputeStatus status);

        long countByStatus(DisputeStatus status);

        // Use TIMESTAMPDIFF for H2 compatibility - computes difference in hours
        @Query(value = "SELECT COALESCE(AVG(TIMESTAMPDIFF(MINUTE, created_at, resolved_at) / 60.0), 0) " +
                        "FROM disputes WHERE resolved_at IS NOT NULL", nativeQuery = true)
        Double averageResolutionHours();

        // Use TIMESTAMPDIFF for H2 compatibility - counts where resolution took more
        // than 48 hours
        @Query(value = "SELECT COUNT(*) FROM disputes " +
                        "WHERE resolved_at IS NOT NULL AND TIMESTAMPDIFF(HOUR, created_at, resolved_at) > 48", nativeQuery = true)
        long countSlaBreaches();
}
