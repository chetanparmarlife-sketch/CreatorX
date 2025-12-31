package com.creatorx.common.dto;

import com.creatorx.common.enums.CampaignPlatform;
import com.creatorx.common.enums.CampaignStatus;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CampaignFilterRequest {
    private String category;
    private CampaignPlatform platform;
    private BigDecimal budgetMin;
    private BigDecimal budgetMax;
    private CampaignStatus status;
    private String search;
}
