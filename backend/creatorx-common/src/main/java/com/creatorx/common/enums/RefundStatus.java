package com.creatorx.common.enums;

/**
 * Refund status tracking for Razorpay refunds
 * Phase 4.2: Razorpay Refund Integration
 *
 * Statuses align with Razorpay refund lifecycle:
 * - CREATED: Refund request initiated locally
 * - PENDING: Submitted to Razorpay, awaiting processing
 * - PROCESSED: Refund successfully processed by Razorpay
 * - FAILED: Refund failed (insufficient funds, invalid payment, etc.)
 */
public enum RefundStatus {
    /**
     * Refund request created locally, not yet sent to Razorpay
     */
    CREATED,

    /**
     * Refund submitted to Razorpay, awaiting processing
     */
    PENDING,

    /**
     * Refund successfully processed - funds returned to customer
     */
    PROCESSED,

    /**
     * Refund failed - see failure reason for details
     */
    FAILED
}
