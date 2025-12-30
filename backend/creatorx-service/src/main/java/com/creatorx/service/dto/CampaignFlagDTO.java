package com.creatorx.service.dto;

import com.creatorx.common.enums.CampaignFlagStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignFlagDTO {
    private String id;
    private String campaignId;
    private String campaignTitle;
    private String ruleId;
    private String ruleName;
    private CampaignFlagStatus status;
    private String reason;
    private String flaggedBy;
    private LocalDateTime flaggedAt;
    private String resolvedBy;
    private LocalDateTime resolvedAt;
    private String resolutionNotes;
}
