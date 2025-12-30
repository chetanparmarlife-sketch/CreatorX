package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignTemplateDeliverableDTO {
    private String id;
    private String title;
    private String description;
    private String type;
    private LocalDate dueDate;
    private Boolean isMandatory;
    private Integer orderIndex;
}
