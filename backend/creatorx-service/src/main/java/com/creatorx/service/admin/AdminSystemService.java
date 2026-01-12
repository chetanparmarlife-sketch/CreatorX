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
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.search.Search;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.HealthComponent;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.health.Status;
import org.springframework.boot.actuate.health.CompositeHealth;
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
    private final MeterRegistry meterRegistry;

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
        HealthComponent healthComponent = healthEndpoint.health();
        String statusCode = healthComponent.getStatus().getCode();
        Map<String, String> componentStatuses = extractComponentStatuses(healthComponent);

        Map<String, Double> metrics = new HashMap<>();
        Double httpAvgMs = computeHttpAverageMs();
        Double httpMaxMs = getMetricValue("http.server.requests.max");
        metrics.put("httpAvgMs", httpAvgMs);
        metrics.put("httpMaxMs", httpMaxMs != null ? httpMaxMs * 1000 : null);
        metrics.put("dbActive", getMetricValue("hikaricp.connections.active"));
        metrics.put("dbMax", getMetricValue("hikaricp.connections.max"));
        metrics.put("jvmHeapUsed", getMetricValue("jvm.memory.used"));
        metrics.put("queueDepth", getMetricValue("executor.queue.remaining"));

        return SystemHealthSummaryDTO.builder()
                .status(statusCode)
                .components(componentStatuses)
                .metrics(metrics)
                .build();
    }

    private Map<String, String> extractComponentStatuses(HealthComponent healthComponent) {
        Map<String, String> statuses = new HashMap<>();
        if (healthComponent instanceof CompositeHealth compositeHealth) {
            compositeHealth.getComponents().forEach((name, component) -> {
                statuses.put(name, component.getStatus().getCode());
            });
        }
        return statuses;
    }

    private Double computeHttpAverageMs() {
        try {
            Timer timer = meterRegistry.find("http.server.requests").timer();
            if (timer != null && timer.count() > 0) {
                return timer.mean(java.util.concurrent.TimeUnit.MILLISECONDS);
            }
        } catch (Exception e) {
            // Metric not available
        }
        return null;
    }

    private Double getMetricValue(String metricName) {
        try {
            Search search = meterRegistry.find(metricName);
            if (search.gauge() != null) {
                return search.gauge().value();
            }
            if (search.counter() != null) {
                return search.counter().count();
            }
            if (search.timer() != null) {
                return (double) search.timer().count();
            }
        } catch (Exception e) {
            // Metric not available
        }
        return null;
    }
}

