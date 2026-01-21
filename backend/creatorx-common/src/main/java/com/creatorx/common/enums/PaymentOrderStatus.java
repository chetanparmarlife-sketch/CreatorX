package com.creatorx.common.enums;

/**
 * Status for payment orders (brand deposits)
 * Phase 4.2: Brand Payment Collection
 */
public enum PaymentOrderStatus {
    /**
     * Order created, awaiting payment
     */
    CREATED,

    /**
     * Payment authorized but not yet captured
     */
    AUTHORIZED,

    /**
     * Payment successfully captured (money received)
     */
    CAPTURED,

    /**
     * Payment failed
     */
    FAILED,

    /**
     * Payment refunded (full or partial)
     */
    REFUNDED,

    /**
     * Order expired (not paid within time limit)
     */
    EXPIRED
}
