package com.creatorx.repository.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.Builder;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;

@Entity
@Table(name = "campaign_deliverables", indexes = {
    @Index(name = "idx_campaign_deliverables_campaign_id", columnList = "campaign_id"),
    @Index(name = "idx_campaign_deliverables_due_date", columnList = "due_date"),
    @Index(name = "idx_campaign_deliverables_type", columnList = "type")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "campaign")
public class CampaignDeliverable extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliverableType type;
    
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;
    
    @Column(name = "is_mandatory")
    @Builder.Default
    private Boolean isMandatory = true;
    
    @Column(name = "order_index")
    @Builder.Default
    private Integer orderIndex = 0;
    
    public enum DeliverableType {
        IMAGE,
        VIDEO,
        STORY,
        REEL,
        POST,
        THUMBNAIL,
        CAPTION
    }
}




