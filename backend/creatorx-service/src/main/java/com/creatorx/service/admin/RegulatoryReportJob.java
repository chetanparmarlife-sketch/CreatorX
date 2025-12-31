package com.creatorx.service.admin;

import com.creatorx.common.enums.UserRole;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegulatoryReportJob {
    private final ComplianceReportService complianceReportService;
    private final UserRepository userRepository;

    @Value("${creatorx.compliance.regulatory.regions:GLOBAL}")
    private String regions;

    @Value("${creatorx.compliance.regulatory.period-days:30}")
    private int periodDays;

    @Scheduled(cron = "${creatorx.compliance.regulatory.cron:0 15 3 * * *}")
    public void generateScheduledReports() {
        Optional<User> admin = userRepository.findFirstByRoleOrderByCreatedAtAsc(UserRole.ADMIN);
        if (admin.isEmpty()) {
            log.warn("Regulatory export generation skipped: no admin user found");
            return;
        }

        LocalDateTime periodEnd = LocalDateTime.now();
        LocalDateTime periodStart = periodEnd.minusDays(periodDays);
        List<String> regionList = Arrays.stream(regions.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();

        for (String region : regionList) {
            try {
                complianceReportService.generateRegulatoryExport(
                        admin.get().getId(),
                        region,
                        periodStart,
                        periodEnd
                );
            } catch (Exception e) {
                log.warn("Failed to generate regulatory report for region {}: {}", region, e.getMessage());
            }
        }
    }
}
