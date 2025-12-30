package com.creatorx.service.dto;

import com.creatorx.common.enums.CampaignPlatform;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignTemplateDTO {
    private String id;
    private String brandId;
    private String title;
    private String description;
    private BigDecimal budget;
    private CampaignPlatform platform;
    private String category;
    private String requirements;
    private List<String> deliverableTypes;
    private List<String> tags;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate applicationDeadline;
    private Integer maxApplicants;
    private List<CampaignTemplateDeliverableDTO> deliverables;
}
