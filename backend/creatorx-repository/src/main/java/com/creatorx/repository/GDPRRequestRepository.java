package com.creatorx.repository;

import com.creatorx.common.enums.GDPRRequestStatus;
import com.creatorx.common.enums.GDPRRequestType;
import com.creatorx.repository.entity.GDPRRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GDPRRequestRepository extends JpaRepository<GDPRRequest, String>, JpaSpecificationExecutor<GDPRRequest> {
    @Query("SELECT g FROM GDPRRequest g WHERE g.user.id = :userId ORDER BY g.createdAt DESC")
    Page<GDPRRequest> findByUserId(@Param("userId") String userId, Pageable pageable);

    @Query("SELECT g FROM GDPRRequest g WHERE g.status = :status ORDER BY g.createdAt DESC")
    Page<GDPRRequest> findByStatus(@Param("status") GDPRRequestStatus status, Pageable pageable);

    @Query("SELECT g FROM GDPRRequest g WHERE g.requestType = :requestType ORDER BY g.createdAt DESC")
    Page<GDPRRequest> findByType(@Param("requestType") GDPRRequestType requestType, Pageable pageable);

    long countByStatus(GDPRRequestStatus status);
}
