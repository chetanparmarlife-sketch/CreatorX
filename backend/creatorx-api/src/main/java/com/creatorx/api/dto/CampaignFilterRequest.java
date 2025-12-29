package com.creatorx.api.dto;

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
    private String sortBy; // "created_at", "budget", "deadline"
    private String sortDirection; // "asc", "desc"
}

