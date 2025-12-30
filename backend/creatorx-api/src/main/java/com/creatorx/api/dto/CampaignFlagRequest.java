package com.creatorx.api.dto;

import lombok.Data;

@Data
public class CampaignFlagRequest {
    private String campaignId;
    private String ruleId;
    private String reason;
}
