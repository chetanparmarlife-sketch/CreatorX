package com.creatorx.common.enums;

/**
 * Campaign escrow funding status
 */
public enum EscrowStatus {
    /**
     * No funds allocated to campaign yet
     */
    UNFUNDED,

    /**
     * Partially funded (escrow_allocated < budget)
     */
    PARTIAL,

    /**
     * Fully funded (escrow_allocated >= budget)
     */
    FUNDED,

    /**
     * All funds released to creators
     */
    RELEASED,

    /**
     * Campaign ended, unused funds refunded to wallet
     */
    REFUNDED
}
