package com.creatorx.common.enums;

/**
 * Escrow transaction types for brand wallet audit trail
 */
public enum EscrowTransactionType {
    /**
     * Money deposited into brand wallet via Razorpay payment
     * Increases wallet balance
     */
    DEPOSIT,

    /**
     * Money allocated from brand wallet to campaign escrow
     * Decreases wallet balance, increases campaign escrow
     */
    ALLOCATION,

    /**
     * Money released from campaign escrow to creator wallet
     * No wallet balance change, tracked for reporting
     */
    RELEASE,

    /**
     * Unused campaign escrow returned to brand wallet
     * Increases wallet balance, decreases campaign escrow
     */
    REFUND
}