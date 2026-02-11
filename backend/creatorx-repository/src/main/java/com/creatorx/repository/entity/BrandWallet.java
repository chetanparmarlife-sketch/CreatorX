package com.creatorx.repository.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Brand wallet entity for escrow management
 * Each brand has one wallet that holds deposited funds
 * Funds are allocated from wallet to campaigns
 */
@Entity
@Table(name = "brand_wallets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "brandId")
public class BrandWallet {

    @Id
    @Column(name = "brand_id", nullable = false)
    private String brandId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", insertable = false, updatable = false)
    @ToString.Exclude
    private User brand;

    /**
     * Available balance that can be allocated to campaigns
     * Formula: totalDeposited - totalAllocated
     */
    @Column(name = "balance", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    /**
     * Lifetime total deposited via Razorpay
     * Increases when payment is captured
     */
    @Column(name = "total_deposited", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalDeposited = BigDecimal.ZERO;

    /**
     * Total currently allocated to campaigns
     * Increases when funds allocated to campaign
     * Decreases when campaign funds are refunded
     */
    @Column(name = "total_allocated", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalAllocated = BigDecimal.ZERO;

    /**
     * Total released to creators (including platform fees)
     * Increases when deliverables are approved and paid
     */
    @Column(name = "total_released", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalReleased = BigDecimal.ZERO;

    @Column(name = "currency", length = 3)
    @Builder.Default
    private String currency = "INR";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Helper methods

    /**
     * Check if wallet has sufficient balance for allocation
     */
    public boolean hasSufficientBalance(BigDecimal amount) {
        return balance.compareTo(amount) >= 0;
    }

    /**
     * Get total locked in campaigns
     * (Allocated but not yet released)
     */
    public BigDecimal getLockedBalance() {
        return totalAllocated.subtract(totalReleased);
    }

    /**
     * Credit wallet from deposit
     */
    public void creditDeposit(BigDecimal amount) {
        this.balance = this.balance.add(amount);
        this.totalDeposited = this.totalDeposited.add(amount);
    }

    /**
     * Debit wallet for campaign allocation
     */
    public void allocateToCampaign(BigDecimal amount) {
        if (!hasSufficientBalance(amount)) {
            throw new IllegalStateException("Insufficient balance");
        }
        this.balance = this.balance.subtract(amount);
        this.totalAllocated = this.totalAllocated.add(amount);
    }

    /**
     * Credit wallet when campaign funds are refunded
     */
    public void refundFromCampaign(BigDecimal amount) {
        this.balance = this.balance.add(amount);
        this.totalAllocated = this.totalAllocated.subtract(amount);
    }

    /**
     * Track release to creator (no wallet balance change)
     */
    public void trackRelease(BigDecimal amount) {
        this.totalReleased = this.totalReleased.add(amount);
    }
}