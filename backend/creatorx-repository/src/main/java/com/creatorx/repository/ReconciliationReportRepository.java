package com.creatorx.repository;

import com.creatorx.common.enums.ReconciliationStatus;
import com.creatorx.repository.entity.ReconciliationReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for ReconciliationReport entity
 * Phase 4.2: Reconciliation Engine
 */
@Repository
public interface ReconciliationReportRepository extends JpaRepository<ReconciliationReport, String> {

    /**
     * Find report by date and type (unique constraint)
     */
    Optional<ReconciliationReport> findByReportDateAndReportType(LocalDate reportDate, String reportType);

    /**
     * Find reports by status
     */
    Page<ReconciliationReport> findByStatus(ReconciliationStatus status, Pageable pageable);

    /**
     * Find reports with discrepancies requiring review
     */
    @Query("SELECT rr FROM ReconciliationReport rr WHERE rr.hasDiscrepancy = true " +
           "AND rr.status = 'COMPLETED' ORDER BY rr.reportDate DESC")
    Page<ReconciliationReport> findReportsWithDiscrepancies(Pageable pageable);

    /**
     * Find reports where alerts haven't been sent yet
     */
    @Query("SELECT rr FROM ReconciliationReport rr WHERE rr.hasDiscrepancy = true " +
           "AND rr.alertSent = false AND rr.status = 'COMPLETED'")
    List<ReconciliationReport> findReportsNeedingAlerts();

    /**
     * Find reports in date range
     */
    @Query("SELECT rr FROM ReconciliationReport rr WHERE rr.reportDate >= :startDate " +
           "AND rr.reportDate <= :endDate ORDER BY rr.reportDate DESC")
    List<ReconciliationReport> findByDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Find latest report by type
     */
    @Query("SELECT rr FROM ReconciliationReport rr WHERE rr.reportType = :reportType " +
           "ORDER BY rr.reportDate DESC LIMIT 1")
    Optional<ReconciliationReport> findLatestByType(@Param("reportType") String reportType);

    /**
     * Check if report already exists for date/type
     */
    boolean existsByReportDateAndReportType(LocalDate reportDate, String reportType);

    /**
     * Find failed reports for retry
     */
    @Query("SELECT rr FROM ReconciliationReport rr WHERE rr.status = 'FAILED' " +
           "AND rr.reportDate >= :since ORDER BY rr.reportDate ASC")
    List<ReconciliationReport> findFailedReportsSince(@Param("since") LocalDate since);
}
