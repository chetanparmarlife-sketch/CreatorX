package com.creatorx.service.razorpay;

import lombok.Builder;
import lombok.Data;

/**
 * Result of bank account verification via Razorpay
 * Phase 4.1: Added to support webhook-based verification
 */
@Data
@Builder
public class BankVerificationResult {

    /**
     * Razorpay fund account ID (for webhook correlation)
     */
    private String fundAccountId;

    /**
     * Whether the account is immediately active (test mode only)
     * In production, this will be false until webhook confirms
     */
    private boolean active;

    /**
     * Verification status: pending, active, failed
     */
    private String status;

    /**
     * Error message if verification failed
     */
    private String errorMessage;

    public static BankVerificationResult success(String fundAccountId, boolean active) {
        return BankVerificationResult.builder()
                .fundAccountId(fundAccountId)
                .active(active)
                .status(active ? "active" : "pending")
                .build();
    }

    public static BankVerificationResult failure(String errorMessage) {
        return BankVerificationResult.builder()
                .active(false)
                .status("failed")
                .errorMessage(errorMessage)
                .build();
    }
}
