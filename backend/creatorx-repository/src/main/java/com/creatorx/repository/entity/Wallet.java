package com.creatorx.repository.entity;
import com.creatorx.repository.converter.UuidToStringConverter;

import com.creatorx.common.enums.CurrencyType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.Builder;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;

@Entity
@Table(name = "wallets", indexes = {
    @Index(name = "idx_wallets_user_id", columnList = "user_id"),
    @Index(name = "idx_wallets_balance", columnList = "balance")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "user")
public class Wallet {
    @Id
    @Column(name = "user_id", columnDefinition = "uuid")
    @Convert(converter = UuidToStringConverter.class)
    private String userId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @MapsId
    private User user;
    
    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;
    
    @Column(name = "pending_balance", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal pendingBalance = BigDecimal.ZERO;
    
    @Column(name = "total_earned", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalEarned = BigDecimal.ZERO;
    
    @Column(name = "total_withdrawn", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalWithdrawn = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CurrencyType currency = CurrencyType.INR;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private java.time.LocalDateTime updatedAt;
}




