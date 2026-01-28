package com.creatorx.repository.entity;

import com.creatorx.common.enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity for invoices - payment records for campaign work.
 * Generated when campaign milestones are completed or campaigns finish.
 */
@Entity
@Table(name = "invoices", indexes = {
        @Index(name = "idx_invoices_creator_id", columnList = "creator_id"),
        @Index(name = "idx_invoices_campaign_id", columnList = "campaign_id"),
        @Index(name = "idx_invoices_status", columnList = "status"),
        @Index(name = "idx_invoices_due_date", columnList = "due_date")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "creator", "campaign" })
@lombok.EqualsAndHashCode(callSuper = true)
public class Invoice extends BaseEntity {

    /**
     * Invoice number (e.g., INV-2024-001)
     */
    @Column(name = "invoice_number", unique = true, nullable = false, length = 50)
    private String invoiceNumber;

    /**
     * Creator who will receive payment
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    /**
     * Campaign this invoice is for
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    /**
     * Brand name (denormalized for display)
     */
    @Column(name = "brand_name", nullable = false)
    private String brandName;

    /**
     * Campaign name (denormalized for display)
     */
    @Column(name = "campaign_name", nullable = false)
    private String campaignName;

    /**
     * Invoice amount
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    /**
     * Currency (default INR)
     */
    @Column(length = 3)
    @Builder.Default
    private String currency = "INR";

    /**
     * Invoice status
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InvoiceStatus status = InvoiceStatus.PENDING;

    /**
     * Invoice issue date
     */
    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    /**
     * Payment due date
     */
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    /**
     * Payment date (if paid)
     */
    @Column(name = "paid_date")
    private LocalDate paidDate;

    /**
     * Description or notes
     */
    @Column(columnDefinition = "TEXT")
    private String description;
}
