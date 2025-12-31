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
    private long totalBrands;
    private long totalCampaigns;
    private long pendingKyc;
    private long pendingBrandVerifications;
    private long openDisputes;
    private long openCampaignFlags;
    private long openAppeals;
    private long pendingGdprRequests;
    private long gdprSlaBreaches;
    private double avgKycDecisionHours;
    private double avgDisputeResolutionHours;
    private long kycSlaBreaches;
    private long disputeSlaBreaches;
    private long adminDailyActiveUsers;
    private double adminCsatAverage;
    private long adminCsatResponses;
    private double userGrowthPercent;
}
