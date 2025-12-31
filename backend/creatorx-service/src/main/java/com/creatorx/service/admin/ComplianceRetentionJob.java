package com.creatorx.service.admin;

import com.creatorx.common.enums.AdminActionType;
import com.creatorx.common.enums.GDPRRequestStatus;
import com.creatorx.common.enums.GDPRRequestType;
import com.creatorx.common.enums.UserRole;
import com.creatorx.repository.GDPRRequestRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.GDPRRequest;
import com.creatorx.repository.entity.User;
import com.creatorx.service.storage.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplianceRetentionJob {
    private final GDPRRequestRepository gdprRequestRepository;
    private final UserRepository userRepository;
    private final SupabaseStorageService storageService;
    private final AdminAuditService adminAuditService;

    @Value("${creatorx.compliance.retention-days:30}")
    private int retentionDays;

    @Scheduled(cron = "${creatorx.compliance.retention-cron:0 30 2 * * *}")
    @Transactional
    public void purgeExpiredExports() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);
        List<GDPRRequest> expired = gdprRequestRepository
                .findByRequestTypeAndStatusAndResolvedAtBefore(GDPRRequestType.EXPORT, GDPRRequestStatus.COMPLETED, cutoff);
        if (expired.isEmpty()) {
            return;
        }

        Optional<User> admin = userRepository.findFirstByRoleOrderByCreatedAtAsc(UserRole.ADMIN);
        if (admin.isEmpty()) {
            log.warn("Compliance retention cleanup skipped audit logging because no admin user exists");
        }

        for (GDPRRequest request : expired) {
            String exportFileUrl = null;
            if (request.getDetailsJson() != null) {
                Object storedUrl = request.getDetailsJson().get("exportFileUrl");
                if (storedUrl != null) {
                    exportFileUrl = storedUrl.toString();
                }
            }

            if (exportFileUrl != null && !exportFileUrl.isBlank()) {
                storageService.deleteFile(exportFileUrl);
            }

            request.setExportUrl(null);
            HashMap<String, Object> details = new HashMap<>(request.getDetailsJson() != null ? request.getDetailsJson() : new HashMap<>());
            details.put("exportPurgedAt", LocalDateTime.now().toString());
            request.setDetailsJson(details);
            gdprRequestRepository.save(request);

            if (admin.isPresent()) {
                HashMap<String, Object> auditDetails = new HashMap<>();
                auditDetails.put("requestId", request.getId());
                auditDetails.put("userId", request.getUser().getId());
                auditDetails.put("exportFileUrl", exportFileUrl);
                adminAuditService.logAction(
                        admin.get().getId(),
                        AdminActionType.SYSTEM_UPDATE,
                        "GDPR_EXPORT_RETENTION",
                        request.getId(),
                        auditDetails,
                        null,
                        null
                );
            }
        }
    }
}
