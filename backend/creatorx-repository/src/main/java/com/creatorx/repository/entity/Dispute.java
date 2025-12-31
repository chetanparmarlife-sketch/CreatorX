package com.creatorx.repository.entity;

import com.creatorx.common.enums.DisputeStatus;
import com.creatorx.common.enums.DisputeType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "disputes", indexes = {
    @Index(name = "idx_campaign_id", columnList = "campaign_id"),
    @Index(name = "idx_creator_id", columnList = "creator_id"),
    @Index(name = "idx_brand_id", columnList = "brand_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_type", columnList = "type"),
    @Index(name = "idx_created_at", columnList = "created_at"),
    @Index(name = "idx_open", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"campaign", "creator", "brand", "resolvedBy"})
public class Dispute extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private User brand;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DisputeType type;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DisputeStatus status = DisputeStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_admin_id")
    private User assignedAdmin;

    @Column(name = "next_action")
    private String nextAction;

    @Column(name = "resolution_type")
    private String resolutionType;

    @Column(name = "sla_first_response_due_at")
    private LocalDateTime slaFirstResponseDueAt;

    @Column(name = "sla_resolution_due_at")
    private LocalDateTime slaResolutionDueAt;

    @Column(columnDefinition = "TEXT")
    private String resolution;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
