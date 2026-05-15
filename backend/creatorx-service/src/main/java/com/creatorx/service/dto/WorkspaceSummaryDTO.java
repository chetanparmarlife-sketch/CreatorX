package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceSummaryDTO {
    private String scope;
    private Instant generatedAt;
    private String systemHealth;

    private long pendingApplications;
    private long pendingDeliverables;
    private long draftCampaigns;
    private long pendingReviewCampaigns;
    private long activeCampaigns;
    private long walletBlockers;
    private long unreadMessages;

    private long pendingKyc;
    private long pendingBrandVerifications;
    private long openDisputes;
    private long flaggedCampaigns;
    private long payoutAlerts;
    private long slaBreaches;

    private Map<String, Long> priorityCounts;
    private List<ActionQueueItemDTO> topActions;
}
