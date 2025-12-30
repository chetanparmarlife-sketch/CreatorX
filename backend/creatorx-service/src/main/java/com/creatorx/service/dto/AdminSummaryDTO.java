package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminSummaryDTO {
    private long totalUsers;
    private long totalCampaigns;
    private long pendingKyc;
    private long pendingBrandVerifications;
    private long openDisputes;
    private long openCampaignFlags;
    private long openAppeals;
    private long pendingGdprRequests;
}
