package com.creatorx.repository;

import com.creatorx.common.enums.ComplianceReportStatus;
import com.creatorx.common.enums.ComplianceReportType;
import com.creatorx.repository.entity.ComplianceReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ComplianceReportRepository extends JpaRepository<ComplianceReport, String>, JpaSpecificationExecutor<ComplianceReport> {
    @Query("SELECT r FROM ComplianceReport r WHERE r.reportType = :type AND r.region = :region " +
            "AND r.periodStart = :periodStart AND r.periodEnd = :periodEnd")
    Optional<ComplianceReport> findExisting(
            @Param("type") ComplianceReportType type,
            @Param("region") String region,
            @Param("periodStart") LocalDateTime periodStart,
            @Param("periodEnd") LocalDateTime periodEnd
    );

    Page<ComplianceReport> findByReportTypeAndStatus(
            ComplianceReportType reportType,
            ComplianceReportStatus status,
            Pageable pageable
    );
}
