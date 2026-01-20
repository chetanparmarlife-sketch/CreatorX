package com.creatorx.common.enums;

/**
 * Status for reconciliation reports
 * Phase 4.2: Reconciliation Engine
 */
public enum ReconciliationStatus {
    /**
     * Report scheduled, not yet started
     */
    PENDING,

    /**
     * Reconciliation job currently running
     */
    RUNNING,

    /**
     * Reconciliation completed successfully (may or may not have discrepancies)
     */
    COMPLETED,

    /**
     * Reconciliation job failed due to error
     */
    FAILED,

    /**
     * Completed but requires manual review due to discrepancies
     */
    NEEDS_REVIEW
}
