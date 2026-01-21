package com.creatorx.repository.entity;

import com.creatorx.common.enums.ReconciliationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity for storing daily reconciliation results
 * Phase 4.2: Reconciliation Engine
 *
 * Tracks:
 * - Daily payment/payout/refund totals
 * - Expected vs actual balances
 * - Discrepancies requiring investigation
 */
@Entity
@Table(name = "reconciliation_reports", indexes = {
        @Index(name = "idx_reconciliation_reports_date", columnList = "report_date"),
        @Index(name = "idx_reconciliation_reports_status", columnList = "status"),
        @Index(name = "idx_reconciliation_reports_has_discrepancy", columnList = "has_discrepancy")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uq_reconciliation_date_type", columnNames = {"report_date", "report_type"})
})
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReconciliationReport extends BaseEntity {

    // Report period
    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate;

    @Column(name = "report_type", nullable = false, length = 50)
    @Builder.Default
    private String reportType = "daily"; // daily, weekly, monthly, adhoc

    // Summary totals
    @Column(name = "total_payments_captured", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalPaymentsCaptured = BigDecimal.ZERO;

    @Column(name = "total_payouts_processed", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalPayoutsProcessed = BigDecimal.ZERO;

    @Column(name = "total_refunds_processed", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalRefundsProcessed = BigDecimal.ZERO;

    // Expected vs Actual balances - Platform
    @Column(name = "expected_platform_balance", precision = 15, scale = 2)
    private BigDecimal expectedPlatformBalance;

    @Column(name = "actual_platform_balance", precision = 15, scale = 2)
    private BigDecimal actualPlatformBalance;

    @Column(name = "platform_delta", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal platformDelta = BigDecimal.ZERO;

    // Expected vs Actual balances - Escrow
    @Column(name = "expected_escrow_balance", precision = 15, scale = 2)
    private BigDecimal expectedEscrowBalance;

    @Column(name = "actual_escrow_balance", precision = 15, scale = 2)
    private BigDecimal actualEscrowBalance;

    @Column(name = "escrow_delta", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal escrowDelta = BigDecimal.ZERO;

    // Transaction counts
    @Column(name = "payment_count")
    @Builder.Default
    private Integer paymentCount = 0;

    @Column(name = "payout_count")
    @Builder.Default
    private Integer payoutCount = 0;

    @Column(name = "refund_count")
    @Builder.Default
    private Integer refundCount = 0;

    // Mismatches found
    @Column(name = "mismatch_count")
    @Builder.Default
    private Integer mismatchCount = 0;

    @Column(columnDefinition = "TEXT")
    private String mismatches; // JSON array of mismatch details

    // Status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private ReconciliationStatus status = ReconciliationStatus.PENDING;

    // Alert flags
    @Column(name = "has_discrepancy")
    @Builder.Default
    private Boolean hasDiscrepancy = false;

    @Column(name = "alert_sent")
    @Builder.Default
    private Boolean alertSent = false;

    @Column(name = "alert_sent_at")
    private LocalDateTime alertSentAt;

    // Execution details
    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "duration_ms")
    private Integer durationMs;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}
