package com.creatorx.api.dto;

import com.creatorx.common.enums.CampaignFlagStatus;
import lombok.Data;

@Data
public class CampaignFlagResolveRequest {
    private CampaignFlagStatus status;
    private String notes;
    private boolean removeCampaign;
}
