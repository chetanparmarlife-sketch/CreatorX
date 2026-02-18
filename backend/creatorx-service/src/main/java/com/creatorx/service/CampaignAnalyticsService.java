package com.creatorx.service;

import com.creatorx.common.enums.ApplicationStatus;
import com.creatorx.common.enums.SubmissionStatus;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.common.exception.UnauthorizedException;
import com.creatorx.repository.ApplicationRepository;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.CreatorProfileRepository;
import com.creatorx.repository.DeliverableRepository;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.CreatorProfile;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.CampaignAnalyticsDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
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
    private final CreatorProfileRepository creatorProfileRepository;
    
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
        // Get selected applications with their creator IDs
        var selectedApplications = applicationRepository.findByCampaignId(campaignId).stream()
                .filter(app -> app.getStatus() == ApplicationStatus.SELECTED)
                .collect(Collectors.toList());

        if (selectedApplications.isEmpty()) {
            return CampaignAnalyticsDTO.EngagementMetrics.builder()
                    .averageEngagementRate(0.0)
                    .totalFollowers(0L)
                    .activeCreators(0L)
                    .averageResponseTime(0.0)
                    .build();
        }

        // Collect creator user IDs from selected applications
        List<String> creatorUserIds = selectedApplications.stream()
                .map(app -> app.getCreator().getId())
                .distinct()
                .collect(Collectors.toList());

        // Query actual creator profiles for engagement data
        List<CreatorProfile> creatorProfiles = creatorProfileRepository.findAllByUserIdIn(creatorUserIds);

        long totalFollowers = 0L;
        double totalEngagementRate = 0.0;
        int profilesWithEngagement = 0;

        for (CreatorProfile profile : creatorProfiles) {
            if (profile.getFollowerCount() != null) {
                totalFollowers += profile.getFollowerCount();
            }
            if (profile.getEngagementRate() != null
                    && profile.getEngagementRate().compareTo(BigDecimal.ZERO) > 0) {
                totalEngagementRate += profile.getEngagementRate().doubleValue();
                profilesWithEngagement++;
            }
        }

        // Calculate average response time from application timestamps
        double avgResponseTimeHours = calculateAverageResponseTime(selectedApplications);

        return CampaignAnalyticsDTO.EngagementMetrics.builder()
                .averageEngagementRate(
                        profilesWithEngagement > 0
                                ? BigDecimal.valueOf(totalEngagementRate / profilesWithEngagement)
                                        .setScale(2, RoundingMode.HALF_UP).doubleValue()
                                : 0.0)
                .totalFollowers(totalFollowers)
                .activeCreators((long) creatorUserIds.size())
                .averageResponseTime(avgResponseTimeHours)
                .build();
    }

    private double calculateAverageResponseTime(
            List<com.creatorx.repository.entity.Application> selectedApplications) {
        // Average time between application submission and selection
        long totalHours = 0;
        int count = 0;
        for (var app : selectedApplications) {
            if (app.getAppliedAt() != null && app.getFeedback() != null
                    && app.getFeedback().getSelectedAt() != null) {
                Duration duration = Duration.between(app.getAppliedAt(), app.getFeedback().getSelectedAt());
                totalHours += duration.toHours();
                count++;
            }
        }
        return count > 0
                ? BigDecimal.valueOf((double) totalHours / count).setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;
    }
}

