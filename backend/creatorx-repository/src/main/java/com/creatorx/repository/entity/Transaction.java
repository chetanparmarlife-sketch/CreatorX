package com.creatorx.repository.entity;

import com.creatorx.common.enums.TransactionStatus;
import com.creatorx.common.enums.TransactionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.Builder;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "transactions", indexes = {
    @Index(name = "idx_transactions_user_id", columnList = "user_id"),
    @Index(name = "idx_transactions_type", columnList = "type"),
    @Index(name = "idx_transactions_status", columnList = "status"),
    @Index(name = "idx_transactions_campaign_id", columnList = "campaign_id"),
    @Index(name = "idx_transactions_created_at", columnList = "created_at"),
    @Index(name = "idx_transactions_user_type_status", columnList = "user_id,type,status"),
    @Index(name = "idx_transactions_razorpay_payment_id", columnList = "razorpay_payment_id")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"user", "campaign", "application"})
public class Transaction extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.PENDING;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private Application application;
    
    @Column(name = "razorpay_payment_id", length = 255)
    private String razorpayPaymentId;
    
    @Column(name = "razorpay_order_id", length = 255)
    private String razorpayOrderId;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "JSONB")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();
}




