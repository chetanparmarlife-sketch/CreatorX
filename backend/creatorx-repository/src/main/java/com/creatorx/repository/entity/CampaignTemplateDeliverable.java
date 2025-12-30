package com.creatorx.repository.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;

@Entity
@Table(name = "campaign_template_deliverables")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "template")
public class CampaignTemplateDeliverable extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private CampaignTemplate template;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 30)
    private String type;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "is_mandatory", nullable = false)
    private Boolean isMandatory;

    @Column(name = "order_index")
    private Integer orderIndex;
}
