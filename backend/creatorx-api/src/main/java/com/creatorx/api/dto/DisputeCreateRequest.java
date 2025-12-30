package com.creatorx.api.dto;

import com.creatorx.common.enums.DisputeType;
import lombok.Data;

@Data
public class DisputeCreateRequest {
    private String campaignId;
    private String creatorId;
    private String brandId;
    private DisputeType type;
    private String description;
}
