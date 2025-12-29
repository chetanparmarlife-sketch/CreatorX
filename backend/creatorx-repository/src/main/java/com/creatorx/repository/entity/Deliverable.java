package com.creatorx.repository.entity;

import com.creatorx.common.enums.DeliverableStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "deliverables", indexes = {
    @Index(name = "idx_active_campaign", columnList = "active_campaign_id"),
    @Index(name = "idx_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Deliverable extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "active_campaign_id", nullable = false)
    private ActiveCampaign activeCampaign;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliverableStatus status;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliverableType type;
    
    @Column(nullable = false)
    private LocalDate dueDate;
    
    private String submittedFileUrl;
    private String submittedFileName;
    private String submittedFileType;
    
    private LocalDateTime submittedAt;
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
    
    private String postUrl;
    
    public enum DeliverableType {
        CONTENT_DRAFT,
        THUMBNAIL,
        CAPTION,
        RAW_FILE,
        POST_PROOF
    }
}




