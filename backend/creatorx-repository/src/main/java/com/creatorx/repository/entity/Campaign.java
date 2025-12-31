package com.creatorx.repository.entity;

import com.creatorx.common.enums.CampaignPlatform;
import com.creatorx.common.enums.CampaignStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "campaigns", indexes = {
    @Index(name = "idx_campaigns_brand_id", columnList = "brand_id"),
    @Index(name = "idx_campaigns_status", columnList = "status"),
    @Index(name = "idx_campaigns_platform", columnList = "platform"),
    @Index(name = "idx_campaigns_category", columnList = "category"),
    @Index(name = "idx_campaigns_start_date", columnList = "start_date"),
    @Index(name = "idx_campaigns_end_date", columnList = "end_date"),
    @Index(name = "idx_campaigns_created_at", columnList = "created_at"),
    @Index(name = "idx_campaigns_status_dates", columnList = "status,start_date,end_date")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"brand", "campaignDeliverables", "applications", "activeCampaigns"})
public class Campaign extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private User brand;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal budget;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampaignPlatform platform;
    
    @Column(nullable = false, length = 100)
    private String category;
    
    @Column(columnDefinition = "TEXT")
    private String requirements;
    
    @ElementCollection
    @CollectionTable(name = "campaign_deliverable_types", joinColumns = @JoinColumn(name = "campaign_id"))
    @Column(name = "deliverable_type")
    private List<String> deliverableTypes = new ArrayList<>();
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CampaignStatus status = CampaignStatus.DRAFT;
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    
    @Column(name = "application_deadline")
    private LocalDate applicationDeadline;
    
    @Column(name = "max_applicants")
    private Integer maxApplicants;
    
    @Column(name = "selected_creators_count")
    @Builder.Default
    private Integer selectedCreatorsCount = 0;

    @Column(name = "review_reason", columnDefinition = "TEXT")
    private String reviewReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private java.time.LocalDateTime reviewedAt;
    
    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CampaignDeliverable> campaignDeliverables = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "campaign_tags", joinColumns = @JoinColumn(name = "campaign_id"))
    @Column(name = "tag", length = 50)
    private List<String> tags = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "campaign_requirements", joinColumns = @JoinColumn(name = "campaign_id"))
    @Column(name = "requirement_text", columnDefinition = "TEXT")
    @OrderColumn(name = "order_index")
    private List<String> requirementTexts = new ArrayList<>();
    
    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Application> applications = new ArrayList<>();
    
    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ActiveCampaign> activeCampaigns = new ArrayList<>();
}



