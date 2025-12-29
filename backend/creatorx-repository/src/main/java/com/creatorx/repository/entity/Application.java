package com.creatorx.repository.entity;

import com.creatorx.common.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications", indexes = {
    @Index(name = "idx_campaign_id", columnList = "campaign_id"),
    @Index(name = "idx_creator_id", columnList = "creator_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_applied_at", columnList = "applied_at"),
    @Index(name = "idx_campaign_status", columnList = "campaign_id,status"),
    @Index(name = "idx_creator_status", columnList = "creator_id,status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"campaign", "creator"})
public class Application extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.APPLIED;
    
    @Column(name = "pitch_text", nullable = false, columnDefinition = "TEXT")
    private String pitchText;
    
    @Column(name = "expected_timeline", length = 255)
    private String expectedTimeline;
    
    @Column(name = "proposed_budget", precision = 12, scale = 2)
    private BigDecimal proposedBudget;
    
    @Column(name = "applied_at", nullable = false, updatable = false)
    private LocalDateTime appliedAt;
    
    @OneToOne(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private ApplicationFeedback feedback;
}

