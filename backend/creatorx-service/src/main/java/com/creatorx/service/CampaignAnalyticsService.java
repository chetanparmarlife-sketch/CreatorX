package com.creatorx.service;

import com.creatorx.common.enums.ApplicationStatus;
import com.creatorx.common.enums.SubmissionStatus;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.common.exception.UnauthorizedException;
import com.creatorx.repository.ApplicationRepository;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.DeliverableRepository;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.CampaignAnalyticsDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for campaign analytics
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CampaignAnalyticsService {
    
    private final CampaignRepository campaignRepository;
    private final ApplicationRepository applicationRepository;
    private final DeliverableRepository deliverableRepository;
    
    /**
     * Get campaign analytics
     * @param range Time range: "7d", "30d", or "all" (default: 30d)
     */
    @Transactional(readOnly = true)
    public CampaignAnalyticsDTO getCampaignAnalytics(String campaignId, User currentUser, String range) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", campaignId));
        
        // Verify brand owns the campaign
        if (currentUser == null || !campaign.getBrand().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only view analytics for your own campaigns");
        }
        
        CampaignAnalyticsDTO.CampaignAnalyticsDTOBuilder builder = CampaignAnalyticsDTO.builder();
        
        // Total applications
        long totalApplications = applicationRepository.countByCampaignId(campaignId);
        builder.totalApplications(totalApplications);
        
        // Application status breakdown
        Map<String, Long> applicationStatusBreakdown = new HashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            long count = applicationRepository.countByCampaignIdAndStatus(campaignId, status);
            if (count > 0) {
                applicationStatusBreakdown.put(status.name(), count);
            }
        }
        builder.applicationStatusBreakdown(applicationStatusBreakdown);
        
        builder.totalSelected(applicationStatusBreakdown.getOrDefault(ApplicationStatus.SELECTED.name(), 0L));
        builder.totalShortlisted(applicationStatusBreakdown.getOrDefault(ApplicationStatus.SHORTLISTED.name(), 0L));
        builder.totalRejected(applicationStatusBreakdown.getOrDefault(ApplicationStatus.REJECTED.name(), 0L));
        
        // Deliverable status breakdown
        Map<String, Long> deliverableStatusBreakdown = new HashMap<>();
        // Get all applications for this campaign
        List<String> applicationIds = applicationRepository.findByCampaignId(campaignId).stream()
                .map(app -> app.getId())
                .collect(Collectors.toList());
        
        if (!applicationIds.isEmpty()) {
            // Count deliverables by status using repository query
            for (SubmissionStatus status : SubmissionStatus.values()) {
                long count = 0;
                for (String applicationId : applicationIds) {
                    count += deliverableRepository.countByApplicationIdAndStatus(applicationId, status);
                }
                if (count > 0) {
                    deliverableStatusBreakdown.put(status.name(), count);
                }
            }
        }
        builder.deliverableStatusBreakdown(deliverableStatusBreakdown);
        
        // Applications over time (based on range)
        List<CampaignAnalyticsDTO.TimeSeriesData> applicationsOverTime = getApplicationsOverTime(campaignId, range);
        builder.applicationsOverTime(applicationsOverTime);
        
        // Engagement metrics
        CampaignAnalyticsDTO.EngagementMetrics engagementMetrics = calculateEngagementMetrics(campaignId);
        builder.engagementMetrics(engagementMetrics);
        
        return builder.build();
    }
    
    private List<CampaignAnalyticsDTO.TimeSeriesData> getApplicationsOverTime(String campaignId, String range) {
        List<CampaignAnalyticsDTO.TimeSeriesData> timeSeries = new ArrayList<>();
        LocalDate endDate = LocalDate.now();
        LocalDate startDate;
        
        // Determine date range
        if ("7d".equalsIgnoreCase(range)) {
            startDate = endDate.minusDays(7);
        } else if ("all".equalsIgnoreCase(range)) {
            // Get campaign creation date or go back 1 year
            startDate = endDate.minusYears(1);
        } else {
            // Default to 30 days
            startDate = endDate.minusDays(30);
        }
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        // Group applications by date
        Map<String, Long> applicationsByDate = applicationRepository.findByCampaignId(campaignId).stream()
                .filter(app -> {
                    LocalDate appliedDate = app.getAppliedAt().toLocalDate();
                    return !appliedDate.isBefore(startDate) && !appliedDate.isAfter(endDate);
                })
                .collect(Collectors.groupingBy(
                        app -> app.getAppliedAt().toLocalDate().format(formatter),
                        Collectors.counting()
                ));
        
        // Fill in all dates in range
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            String dateStr = currentDate.format(formatter);
            timeSeries.add(CampaignAnalyticsDTO.TimeSeriesData.builder()
                    .date(dateStr)
                    .count(applicationsByDate.getOrDefault(dateStr, 0L))
                    .build());
            currentDate = currentDate.plusDays(1);
        }
        
        return timeSeries;
    }
    
    private CampaignAnalyticsDTO.EngagementMetrics calculateEngagementMetrics(String campaignId) {
        // Get selected applications
        List<String> selectedApplicationIds = applicationRepository.findByCampaignId(campaignId).stream()
                .filter(app -> app.getStatus() == ApplicationStatus.SELECTED)
                .map(app -> app.getId())
                .collect(Collectors.toList());
        
        if (selectedApplicationIds.isEmpty()) {
            return CampaignAnalyticsDTO.EngagementMetrics.builder()
                    .averageEngagementRate(0.0)
                    .totalFollowers(0L)
                    .activeCreators(0L)
                    .averageResponseTime(0.0)
                    .build();
        }
        
        // Calculate metrics from selected creators
        // This is a simplified version - in production, you'd query creator profiles
        long totalFollowers = 0L;
        double totalEngagementRate = 0.0;
        int creatorCount = selectedApplicationIds.size();
        
        // TODO: Query creator profiles for actual engagement data
        // For now, return placeholder values
        
        return CampaignAnalyticsDTO.EngagementMetrics.builder()
                .averageEngagementRate(creatorCount > 0 ? totalEngagementRate / creatorCount : 0.0)
                .totalFollowers(totalFollowers)
                .activeCreators((long) creatorCount)
                .averageResponseTime(24.0) // Placeholder
                .build();
    }
}

