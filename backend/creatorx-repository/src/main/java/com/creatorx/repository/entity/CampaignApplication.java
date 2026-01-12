package com.creatorx.repository.entity;

import com.creatorx.common.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "campaign_applications", indexes = {
    @Index(name = "idx_campaign_creator", columnList = "campaign_id,creator_id"),
    @Index(name = "idx_status", columnList = "status")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignApplication extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String pitch;
    
    @Column(nullable = false)
    private String expectedTimeline;
    
    @Column(columnDefinition = "TEXT")
    private String extraDetails;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;
    
    private LocalDateTime reviewedAt;
    
    @Column(columnDefinition = "TEXT")
    private String brandFeedback;
}




