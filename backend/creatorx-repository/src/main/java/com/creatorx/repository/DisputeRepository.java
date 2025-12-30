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

    long countByStatus(DisputeStatus status);
}
