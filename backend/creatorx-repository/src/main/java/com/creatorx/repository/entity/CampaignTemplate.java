package com.creatorx.repository.entity;

import com.creatorx.common.enums.CampaignPlatform;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "campaign_templates", indexes = {
    @Index(name = "idx_campaign_templates_brand_id", columnList = "brand_id"),
    @Index(name = "idx_campaign_templates_platform", columnList = "platform"),
    @Index(name = "idx_campaign_templates_category", columnList = "category")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"brand", "deliverables"})
public class CampaignTemplate extends BaseEntity {
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
    @CollectionTable(name = "campaign_template_deliverable_types", joinColumns = @JoinColumn(name = "template_id"))
    @Column(name = "deliverable_type")
    private List<String> deliverableTypes = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "campaign_template_tags", joinColumns = @JoinColumn(name = "template_id"))
    @Column(name = "tag", length = 50)
    private List<String> tags = new ArrayList<>();

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "application_deadline")
    private LocalDate applicationDeadline;

    @Column(name = "max_applicants")
    private Integer maxApplicants;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CampaignTemplateDeliverable> deliverables = new ArrayList<>();
}
