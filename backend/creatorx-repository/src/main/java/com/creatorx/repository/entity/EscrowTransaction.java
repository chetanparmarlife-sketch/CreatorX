package com.creatorx.repository.entity;

import com.creatorx.common.enums.EscrowTransactionType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Escrow transaction entity - audit trail for all wallet movements
 * Tracks deposits, allocations, releases, and refunds
 */
@Entity
@Table(name = "escrow_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class EscrowTransaction {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "brand_id", nullable = false)
    private String brandId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", insertable = false, updatable = false)
    @ToString.Exclude
    private User brand;

    @Column(name = "campaign_id")
    private String campaignId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", insertable = false, updatable = false)
    @ToString.Exclude
    private Campaign campaign;

    @Column(name = "payment_order_id")
    private String paymentOrderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_order_id", insertable = false, updatable = false)
    @ToString.Exclude
    private PaymentOrder paymentOrder;

    /**
     * Transaction type:
     * DEPOSIT - Money added to wallet via Razorpay
     * ALLOCATION - Money allocated from wallet to campaign
     * RELEASE - Money released from campaign to creator
     * REFUND - Unused campaign money returned to wallet
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private EscrowTransactionType type;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    /**
     * Wallet balance before this transaction
     * Null for RELEASE transactions (no wallet balance change)
     */
    @Column(name = "balance_before", precision = 15, scale = 2)
    private BigDecimal balanceBefore;

    /**
     * Wallet balance after this transaction
     * Null for RELEASE transactions (no wallet balance change)
     */
    @Column(name = "balance_after", precision = 15, scale = 2)
    private BigDecimal balanceAfter;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Additional metadata in JSON format
     * Can include: razorpay IDs, creator details, etc.
     */
    @Column(name = "metadata", columnDefinition = "jsonb")
    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> metadata = new HashMap<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
        if (this.metadata == null) {
            this.metadata = new HashMap<>();
        }
    }
}
