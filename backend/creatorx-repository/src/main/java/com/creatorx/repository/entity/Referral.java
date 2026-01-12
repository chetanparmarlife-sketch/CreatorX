package com.creatorx.repository.entity;

import com.creatorx.common.enums.ReferralStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "referrals", indexes = {
    @Index(name = "idx_referrer_id", columnList = "referrer_id"),
    @Index(name = "idx_referee_id", columnList = "referee_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"referrer", "referee"})
public class Referral extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referrer_id", nullable = false)
    private User referrer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referee_id", nullable = false)
    private User referee;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ReferralStatus status = ReferralStatus.PENDING;
    
    @Column(name = "reward_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal rewardAmount = BigDecimal.ZERO;
    
    @Column(name = "referrer_reward", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal referrerReward = BigDecimal.ZERO;
    
    @Column(name = "referee_reward", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal refereeReward = BigDecimal.ZERO;
    
    @Column(name = "completed_criteria", columnDefinition = "JSONB")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> completedCriteria;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}

