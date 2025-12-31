package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandVerificationRiskDTO {
    private long priorRejections;
    private long openDisputes;
    private long openCampaignFlags;
    private String userStatus;
}
