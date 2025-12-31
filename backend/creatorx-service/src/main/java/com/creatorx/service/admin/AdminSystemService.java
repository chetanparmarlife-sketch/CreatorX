package com.creatorx.service.admin;

import com.creatorx.common.enums.AppealStatus;
import com.creatorx.common.enums.CampaignFlagStatus;
import com.creatorx.common.enums.DisputeStatus;
import com.creatorx.common.enums.DocumentStatus;
import com.creatorx.common.enums.GDPRRequestStatus;
import com.creatorx.repository.*;
import com.creatorx.service.dto.SystemHealthSummaryDTO;
import com.creatorx.service.dto.AdminSummaryDTO;
import com.creatorx.common.enums.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.metrics.MetricsEndpoint;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminSystemService {
    private static final int GDPR_SLA_HOURS = 72;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final KYCDocumentRepository kycDocumentRepository;
    private final BrandVerificationDocumentRepository brandVerificationDocumentRepository;
    private final DisputeRepository disputeRepository;
    private final CampaignFlagRepository campaignFlagRepository;
    private final AccountAppealRepository accountAppealRepository;
    private final GDPRRequestRepository gdprRequestRepository;
    private final AdminSessionEventRepository adminSessionEventRepository;
    private final AdminFeedbackRepository adminFeedbackRepository;
    private final HealthEndpoint healthEndpoint;
    private final MetricsEndpoint metricsEndpoint;

    @Transactional(readOnly = true)
    public AdminSummaryDTO getSummary() {
        Double avgKyc = kycDocumentRepository.averageDecisionHours();
        Double avgDispute = disputeRepository.averageResolutionHours();
        double avgKycHours = avgKyc != null ? avgKyc : 0.0;
        double avgDisputeHours = avgDispute != null ? avgDispute : 0.0;
        LocalDateTime dayStart = LocalDate.now().atStartOfDay();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime gdprSlaCutoff = now.minusHours(GDPR_SLA_HOURS);
        LocalDateTime currentPeriodStart = now.minusDays(30);
        LocalDateTime previousPeriodStart = now.minusDays(60);
        long currentPeriodUsers = userRepository.countByCreatedAtBetween(currentPeriodStart, now);
        long previousPeriodUsers = userRepository.countByCreatedAtBetween(previousPeriodStart, currentPeriodStart);
        double growthPercent = previousPeriodUsers == 0
                ? (currentPeriodUsers > 0 ? 100.0 : 0.0)
                : ((double) (currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100.0;
        LocalDateTime csatWindowStart = now.minusDays(30);
        Double csatAverage = adminFeedbackRepository.averageRatingSince(csatWindowStart);
        long csatResponses = adminFeedbackRepository.countSince(csatWindowStart);
        return AdminSummaryDTO.builder()
                .totalUsers(userRepository.count())
                .totalBrands(userRepository.countByRole(UserRole.BRAND))
                .totalCampaigns(campaignRepository.count())
                .pendingKyc(kycDocumentRepository.countByStatus(DocumentStatus.PENDING))
                .pendingBrandVerifications(brandVerificationDocumentRepository.countByStatus("PENDING"))
                .openDisputes(disputeRepository.countByStatus(DisputeStatus.OPEN))
                .openCampaignFlags(campaignFlagRepository.countByStatus(CampaignFlagStatus.OPEN))
                .openAppeals(accountAppealRepository.countByStatus(AppealStatus.OPEN))
                .pendingGdprRequests(gdprRequestRepository.countByStatus(GDPRRequestStatus.PENDING))
                .gdprSlaBreaches(gdprRequestRepository.countSlaBreaches(gdprSlaCutoff))
                .avgKycDecisionHours(avgKycHours)
                .avgDisputeResolutionHours(avgDisputeHours)
                .kycSlaBreaches(kycDocumentRepository.countSlaBreaches())
                .disputeSlaBreaches(disputeRepository.countSlaBreaches())
                .adminDailyActiveUsers(adminSessionEventRepository.countDistinctAdmins(dayStart, now))
                .adminCsatAverage(csatAverage != null ? csatAverage : 0.0)
                .adminCsatResponses(csatResponses)
                .userGrowthPercent(growthPercent)
                .build();
    }

    @Transactional(readOnly = true)
    public SystemHealthSummaryDTO getHealthSummary() {
        Health health = healthEndpoint.health();
        Map<String, String> componentStatuses = extractComponentStatuses(health);

        Map<String, Double> metrics = new HashMap<>();
        Double httpAvgMs = computeHttpAverageMs();
        Double httpMaxMs = getMetricValue("http.server.requests", "MAX");
        metrics.put("httpAvgMs", httpAvgMs);
        metrics.put("httpMaxMs", httpMaxMs != null ? httpMaxMs * 1000 : null);
        metrics.put("dbActive", getMetricValue("hikaricp.connections.active", "VALUE"));
        metrics.put("dbMax", getMetricValue("hikaricp.connections.max", "VALUE"));
        metrics.put("jvmHeapUsed", getMetricValue("jvm.memory.used", "VALUE"));
        metrics.put("queueDepth", getMetricValue("executor.queue.size", "VALUE"));

        return SystemHealthSummaryDTO.builder()
                .status(health.getStatus().getCode())
                .components(componentStatuses)
                .metrics(metrics)
                .build();
    }

    private Map<String, String> extractComponentStatuses(Health health) {
        Map<String, String> statuses = new HashMap<>();
        if (health.getDetails() == null) {
            return statuses;
        }
        health.getDetails().forEach((name, detail) -> {
            if (detail instanceof Health nested) {
                statuses.put(name, nested.getStatus().getCode());
            } else if (detail instanceof Map<?, ?> detailMap) {
                Object status = detailMap.get("status");
                statuses.put(name, status != null ? status.toString() : "UNKNOWN");
            } else {
                statuses.put(name, "UNKNOWN");
            }
        });
        return statuses;
    }

    private Double computeHttpAverageMs() {
        MetricsEndpoint.MetricResponse response = metricsEndpoint.metric("http.server.requests", null);
        if (response == null || response.getMeasurements() == null) {
            return null;
        }
        Double totalTime = response.getMeasurements().stream()
                .filter(measurement -> "TOTAL_TIME".equalsIgnoreCase(measurement.getStatistic().name()))
                .map(MetricsEndpoint.Measurement::getValue)
                .findFirst()
                .orElse(null);
        Double count = response.getMeasurements().stream()
                .filter(measurement -> "COUNT".equalsIgnoreCase(measurement.getStatistic().name()))
                .map(MetricsEndpoint.Measurement::getValue)
                .findFirst()
                .orElse(null);
        if (totalTime == null || count == null || count == 0) {
            return null;
        }
        return (totalTime / count) * 1000;
    }

    private Double getMetricValue(String metricName, String statistic) {
        MetricsEndpoint.MetricResponse response = metricsEndpoint.metric(metricName, null);
        if (response == null || response.getMeasurements() == null) {
            return null;
        }
        return response.getMeasurements().stream()
                .filter(measurement -> statistic.equalsIgnoreCase(measurement.getStatistic().name()))
                .map(MetricsEndpoint.Measurement::getValue)
                .findFirst()
                .orElse(null);
    }
}
