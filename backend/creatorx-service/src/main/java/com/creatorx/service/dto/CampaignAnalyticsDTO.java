package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO for campaign analytics data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignAnalyticsDTO {
    private Long totalApplications;
    private Long totalSelected;
    private Long totalShortlisted;
    private Long totalRejected;
    
    // Application status breakdown
    private Map<String, Long> applicationStatusBreakdown;
    
    // Deliverable status breakdown
    private Map<String, Long> deliverableStatusBreakdown;
    
    // Applications over time (last 30 days)
    private List<TimeSeriesData> applicationsOverTime;
    
    // Creator engagement metrics
    private EngagementMetrics engagementMetrics;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSeriesData {
        private String date;
        private Long count;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EngagementMetrics {
        private Double averageEngagementRate;
        private Long totalFollowers;
        private Long activeCreators;
        private Double averageResponseTime; // in hours
    }
}

