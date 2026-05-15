package com.creatorx.service;

import com.creatorx.common.enums.ApplicationStatus;
import com.creatorx.common.enums.CampaignFlagStatus;
import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.common.enums.DisputeStatus;
import com.creatorx.common.enums.DocumentStatus;
import com.creatorx.common.enums.SubmissionStatus;
import com.creatorx.common.enums.WithdrawalStatus;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.repository.ApplicationRepository;
import com.creatorx.repository.BrandVerificationDocumentRepository;
import com.creatorx.repository.CampaignFlagRepository;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.ConversationRepository;
import com.creatorx.repository.DeliverableRepository;
import com.creatorx.repository.DisputeRepository;
import com.creatorx.repository.KYCDocumentRepository;
import com.creatorx.repository.WithdrawalRequestRepository;
import com.creatorx.repository.entity.Application;
import com.creatorx.repository.entity.BrandVerificationDocument;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.CampaignFlag;
import com.creatorx.repository.entity.DeliverableSubmission;
import com.creatorx.repository.entity.Dispute;
import com.creatorx.repository.entity.KYCDocument;
import com.creatorx.repository.entity.User;
import com.creatorx.repository.entity.WithdrawalRequest;
import com.creatorx.service.admin.AdminCampaignReviewService;
import com.creatorx.service.dto.ActionQueueItemDTO;
import com.creatorx.service.dto.BulkActionResponseDTO;
import com.creatorx.service.dto.BulkActionResultDTO;
import com.creatorx.service.dto.CampaignDTO;
import com.creatorx.service.dto.WorkspaceSummaryDTO;
import com.creatorx.service.metrics.EnterpriseSlaTargets;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.DistributionSummary;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Supplier;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnterpriseWorkspaceService {
    private static final List<CampaignStatus> FUNDED_CAMPAIGN_STATUSES = List.of(
            CampaignStatus.PENDING_REVIEW,
            CampaignStatus.ACTIVE,
            CampaignStatus.PAUSED
    );

    private final ApplicationRepository applicationRepository;
    private final DeliverableRepository deliverableRepository;
    private final CampaignRepository campaignRepository;
    private final ConversationRepository conversationRepository;
    private final KYCDocumentRepository kycDocumentRepository;
    private final BrandVerificationDocumentRepository brandVerificationDocumentRepository;
    private final DisputeRepository disputeRepository;
    private final CampaignFlagRepository campaignFlagRepository;
    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final ApplicationService applicationService;
    private final DeliverableService deliverableService;
    private final CampaignService campaignService;
    private final KYCService kycService;
    private final BrandVerificationService brandVerificationService;
    private final AdminCampaignReviewService adminCampaignReviewService;
    private final MeterRegistry meterRegistry;

    @Transactional(readOnly = true)
    public WorkspaceSummaryDTO getBrandSummary(String brandId) {
        return timed("brand.workspace-summary", () -> {
            long pendingApplications = applicationRepository.countByBrandIdAndStatus(brandId, ApplicationStatus.APPLIED);
            long pendingDeliverables = deliverableRepository.countByBrandIdAndStatus(brandId, SubmissionStatus.PENDING);
            long draftCampaigns = campaignRepository.countByBrandIdAndStatus(brandId, CampaignStatus.DRAFT);
            long pendingReviewCampaigns = campaignRepository.countByBrandIdAndStatus(brandId, CampaignStatus.PENDING_REVIEW);
            long activeCampaigns = campaignRepository.countByBrandIdAndStatus(brandId, CampaignStatus.ACTIVE);
            long walletBlockers = campaignRepository.countBrandCampaignsByEscrowStatusAndStatuses(
                    brandId,
                    "UNFUNDED",
                    FUNDED_CAMPAIGN_STATUSES
            );
            long unreadMessages = conversationRepository.sumBrandUnreadCount(brandId);

            Map<String, Long> counts = new LinkedHashMap<>();
            counts.put("pendingApplications", pendingApplications);
            counts.put("pendingDeliverables", pendingDeliverables);
            counts.put("walletBlockers", walletBlockers);
            counts.put("pendingReviewCampaigns", pendingReviewCampaigns);
            counts.put("unreadMessages", unreadMessages);
            recordQueueDepth("brand", "applications", "needs_action", pendingApplications);
            recordQueueDepth("brand", "deliverables", "needs_action", pendingDeliverables);
            recordQueueDepth("brand", "wallet_blockers", "blocked", walletBlockers);
            recordQueueDepth("brand", "campaign_review", "pending", pendingReviewCampaigns);

            return WorkspaceSummaryDTO.builder()
                    .scope("brand")
                    .generatedAt(Instant.now())
                    .systemHealth("OPERATIONAL")
                    .pendingApplications(pendingApplications)
                    .pendingDeliverables(pendingDeliverables)
                    .draftCampaigns(draftCampaigns)
                    .pendingReviewCampaigns(pendingReviewCampaigns)
                    .activeCampaigns(activeCampaigns)
                    .walletBlockers(walletBlockers)
                    .unreadMessages(unreadMessages)
                    .priorityCounts(counts)
                    .topActions(getBrandActionQueue(brandId, PageRequest.of(0, 5)).getContent())
                    .build();
        });
    }

    @Transactional(readOnly = true)
    public WorkspaceSummaryDTO getAdminSummary() {
        return timed("admin.workspace-summary", () -> {
            long pendingKyc = kycDocumentRepository.countByStatus(DocumentStatus.PENDING);
            long pendingBrandVerifications = brandVerificationDocumentRepository.countByStatus("PENDING");
            long openDisputes = disputeRepository.countByStatus(DisputeStatus.OPEN);
            long flaggedCampaigns = campaignFlagRepository.countByStatus(CampaignFlagStatus.OPEN);
            long payoutAlerts = withdrawalRequestRepository.countByStatus(WithdrawalStatus.PENDING);
            long pendingReviewCampaigns = campaignRepository.countByStatus(CampaignStatus.PENDING_REVIEW);
            long slaBreaches = kycDocumentRepository.countSlaBreaches() + disputeRepository.countSlaBreaches();

            Map<String, Long> counts = new LinkedHashMap<>();
            counts.put("pendingKyc", pendingKyc);
            counts.put("pendingBrandVerifications", pendingBrandVerifications);
            counts.put("pendingReviewCampaigns", pendingReviewCampaigns);
            counts.put("flaggedCampaigns", flaggedCampaigns);
            counts.put("openDisputes", openDisputes);
            counts.put("payoutAlerts", payoutAlerts);
            counts.put("slaBreaches", slaBreaches);
            recordQueueDepth("admin", "kyc", "needs_action", pendingKyc);
            recordQueueDepth("admin", "brand_verification", "needs_action", pendingBrandVerifications);
            recordQueueDepth("admin", "campaign_moderation", "pending", pendingReviewCampaigns);
            recordQueueDepth("admin", "campaign_flags", "blocked", flaggedCampaigns);
            recordQueueDepth("admin", "disputes", "blocked", openDisputes);
            recordQueueDepth("admin", "payout_alerts", "needs_action", payoutAlerts);

            return WorkspaceSummaryDTO.builder()
                    .scope("admin")
                    .generatedAt(Instant.now())
                    .systemHealth("OPERATIONAL")
                    .pendingKyc(pendingKyc)
                    .pendingBrandVerifications(pendingBrandVerifications)
                    .pendingReviewCampaigns(pendingReviewCampaigns)
                    .openDisputes(openDisputes)
                    .flaggedCampaigns(flaggedCampaigns)
                    .payoutAlerts(payoutAlerts)
                    .slaBreaches(slaBreaches)
                    .priorityCounts(counts)
                    .topActions(getAdminActionQueue(PageRequest.of(0, 5)).getContent())
                    .build();
        });
    }

    @Transactional(readOnly = true)
    public Page<ActionQueueItemDTO> getBrandActionQueue(String brandId, Pageable pageable) {
        return timed("brand.action-queue", () -> {
            int fetchSize = Math.min(Math.max((pageable.getPageNumber() + 1) * pageable.getPageSize(), 10), 100);
            Pageable firstPage = PageRequest.of(0, fetchSize, Sort.by(Sort.Direction.ASC, "createdAt"));
            List<ActionQueueItemDTO> items = new ArrayList<>();

            applicationRepository.findPendingApplicationsForBrand(brandId, firstPage)
                    .forEach(item -> items.add(mapApplication(item)));
            deliverableRepository.findPendingDeliverablesForBrand(brandId, firstPage)
                    .forEach(item -> items.add(mapDeliverable(item)));
            campaignRepository.findByBrandIdAndStatus(brandId, CampaignStatus.DRAFT, firstPage)
                    .forEach(item -> items.add(mapBrandCampaign(item, "Submit for review", "campaign_submit")));
            campaignRepository.findByBrandIdAndStatus(brandId, CampaignStatus.PENDING_REVIEW, firstPage)
                    .forEach(item -> items.add(mapBrandCampaign(item, "Track review", "campaign_review")));

            long total = applicationRepository.countByBrandIdAndStatus(brandId, ApplicationStatus.APPLIED)
                    + deliverableRepository.countByBrandIdAndStatus(brandId, SubmissionStatus.PENDING)
                    + campaignRepository.countByBrandIdAndStatus(brandId, CampaignStatus.DRAFT)
                    + campaignRepository.countByBrandIdAndStatus(brandId, CampaignStatus.PENDING_REVIEW);

            return pageFromSortedItems(items, pageable, total);
        });
    }

    @Transactional(readOnly = true)
    public Page<ActionQueueItemDTO> getAdminActionQueue(Pageable pageable) {
        return timed("admin.action-queue", () -> {
            int fetchSize = Math.min(Math.max((pageable.getPageNumber() + 1) * pageable.getPageSize(), 10), 100);
            Pageable firstPage = PageRequest.of(0, fetchSize, Sort.by(Sort.Direction.ASC, "createdAt"));
            List<ActionQueueItemDTO> items = new ArrayList<>();

            kycDocumentRepository.findByStatus(DocumentStatus.PENDING, firstPage)
                    .forEach(item -> items.add(mapKyc(item)));
            brandVerificationDocumentRepository.findByStatus("PENDING", firstPage)
                    .forEach(item -> items.add(mapBrandVerification(item)));
            campaignRepository.findByStatus(CampaignStatus.PENDING_REVIEW, firstPage)
                    .forEach(item -> items.add(mapAdminCampaign(item)));
            disputeRepository.findByStatus(DisputeStatus.OPEN, firstPage)
                    .forEach(item -> items.add(mapDispute(item)));
            campaignFlagRepository.findByStatus(CampaignFlagStatus.OPEN, firstPage)
                    .forEach(item -> items.add(mapCampaignFlag(item)));
            withdrawalRequestRepository.findByStatus(WithdrawalStatus.PENDING, firstPage)
                    .forEach(item -> items.add(mapWithdrawal(item)));

            long total = kycDocumentRepository.countByStatus(DocumentStatus.PENDING)
                    + brandVerificationDocumentRepository.countByStatus("PENDING")
                    + campaignRepository.countByStatus(CampaignStatus.PENDING_REVIEW)
                    + disputeRepository.countByStatus(DisputeStatus.OPEN)
                    + campaignFlagRepository.countByStatus(CampaignFlagStatus.OPEN)
                    + withdrawalRequestRepository.countByStatus(WithdrawalStatus.PENDING);

            return pageFromSortedItems(items, pageable, total);
        });
    }

    @Transactional
    public BulkActionResponseDTO executeBrandBulkAction(String brandId, String actionType, List<String> entityIds,
            String status, String reason, String feedback) {
        return timed("brand.bulk-actions", () -> executeBulkAction(actionType, entityIds, entityId -> switch (normalized(actionType)) {
            case "APPLICATION_STATUS" -> applicationService.updateApplicationStatus(
                    brandId,
                    entityId,
                    ApplicationStatus.valueOf(required(status, "status").toUpperCase(Locale.ROOT)),
                    reason
            );
            case "DELIVERABLE_REVIEW" -> deliverableService.reviewDeliverable(
                    brandId,
                    entityId,
                    SubmissionStatus.valueOf(required(status, "status").toUpperCase(Locale.ROOT)),
                    feedback != null ? feedback : reason
            );
            case "CAMPAIGN_LIFECYCLE" -> campaignService.updateCampaign(
                    entityId,
                    CampaignDTO.builder()
                            .status(CampaignStatus.valueOf(required(status, "status").toUpperCase(Locale.ROOT)))
                            .build(),
                    brandId
            );
            default -> throw new BusinessException("Unsupported brand bulk action: " + actionType);
        }));
    }

    @Transactional
    public BulkActionResponseDTO executeAdminBulkAction(String adminId, String actionType, List<String> entityIds,
            String status, String reason) {
        return timed("admin.bulk-actions", () -> executeBulkAction(actionType, entityIds, entityId -> switch (normalized(actionType)) {
            case "KYC_REVIEW" -> {
                DocumentStatus documentStatus = DocumentStatus.valueOf(required(status, "status").toUpperCase(Locale.ROOT));
                if (documentStatus == DocumentStatus.APPROVED) {
                    kycService.approveKYC(adminId, entityId);
                } else if (documentStatus == DocumentStatus.REJECTED) {
                    kycService.rejectKYC(adminId, entityId, required(reason, "reason"));
                } else {
                    throw new BusinessException("Unsupported KYC review status: " + status);
                }
                yield null;
            }
            case "BRAND_VERIFICATION" -> brandVerificationService.reviewDocument(
                    adminId,
                    entityId,
                    required(status, "status"),
                    reason
            );
            case "CAMPAIGN_MODERATION" -> {
                String nextStatus = required(status, "status").toUpperCase(Locale.ROOT);
                if ("APPROVED".equals(nextStatus) || "ACTIVE".equals(nextStatus)) {
                    yield adminCampaignReviewService.approveCampaign(adminId, entityId);
                }
                if ("REJECTED".equals(nextStatus) || "CANCELLED".equals(nextStatus)) {
                    yield adminCampaignReviewService.rejectCampaign(adminId, entityId, required(reason, "reason"));
                }
                if ("ESCALATED".equals(nextStatus) || "ESCALATE".equals(nextStatus)) {
                    yield adminCampaignReviewService.escalateCampaign(adminId, entityId, reason);
                }
                throw new BusinessException("Unsupported campaign moderation status: " + status);
            }
            default -> throw new BusinessException("Unsupported admin bulk action: " + actionType);
        }));
    }

    private BulkActionResponseDTO executeBulkAction(String actionType, List<String> entityIds, BulkOperation operation) {
        List<String> safeIds = entityIds == null ? List.of() : entityIds;
        List<BulkActionResultDTO> results = new ArrayList<>();
        int succeeded = 0;

        for (String entityId : safeIds) {
            try {
                Object updated = operation.apply(entityId);
                results.add(BulkActionResultDTO.builder()
                        .entityId(entityId)
                        .success(true)
                        .message("Updated")
                        .updated(updated)
                        .build());
                succeeded++;
            } catch (Exception error) {
                results.add(BulkActionResultDTO.builder()
                        .entityId(entityId)
                        .success(false)
                        .message(error.getMessage())
                        .build());
            }
        }

        recordBulkActionMetrics(actionType, safeIds.size(), succeeded, safeIds.size() - succeeded);

        return BulkActionResponseDTO.builder()
                .actionType(actionType)
                .requested(safeIds.size())
                .succeeded(succeeded)
                .failed(safeIds.size() - succeeded)
                .results(results)
                .build();
    }

    private Page<ActionQueueItemDTO> pageFromSortedItems(List<ActionQueueItemDTO> items, Pageable pageable, long total) {
        List<ActionQueueItemDTO> sorted = items.stream()
                .sorted(Comparator
                        .comparingInt(this::severityRank)
                        .thenComparing(ActionQueueItemDTO::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), sorted.size());
        List<ActionQueueItemDTO> content = start >= sorted.size() ? List.of() : sorted.subList(start, end);
        return new PageImpl<>(content, pageable, total);
    }

    private ActionQueueItemDTO mapApplication(Application application) {
        Campaign campaign = application.getCampaign();
        String creatorName = displayName(application.getCreator());
        return ActionQueueItemDTO.builder()
                .id("application:" + application.getId())
                .type("application")
                .severity(ageSeverity(application.getAppliedAt(), 48, 24))
                .dueState(ageDueState(application.getAppliedAt(), 48, 24))
                .entityId(application.getId())
                .title(creatorName + " applied to " + campaign.getTitle())
                .subtitle("Review pitch and shortlist, select, or reject.")
                .primaryAction("Review application")
                .href("/applications?applicationId=" + application.getId())
                .createdAt(toInstant(application.getAppliedAt()))
                .metadata(Map.of("campaignId", campaign.getId(), "campaignTitle", campaign.getTitle()))
                .build();
    }

    private ActionQueueItemDTO mapDeliverable(DeliverableSubmission deliverable) {
        Campaign campaign = deliverable.getApplication().getCampaign();
        return ActionQueueItemDTO.builder()
                .id("deliverable:" + deliverable.getId())
                .type("deliverable")
                .severity(ageSeverity(deliverable.getSubmittedAt(), 36, 18))
                .dueState(ageDueState(deliverable.getSubmittedAt(), 36, 18))
                .entityId(deliverable.getId())
                .title("Deliverable ready for " + campaign.getTitle())
                .subtitle(displayName(deliverable.getApplication().getCreator()) + " is waiting for feedback.")
                .primaryAction("Review deliverable")
                .href("/deliverables?submissionId=" + deliverable.getId())
                .createdAt(toInstant(deliverable.getSubmittedAt()))
                .metadata(Map.of("campaignId", campaign.getId(), "campaignTitle", campaign.getTitle()))
                .build();
    }

    private ActionQueueItemDTO mapBrandCampaign(Campaign campaign, String action, String type) {
        return ActionQueueItemDTO.builder()
                .id(type + ":" + campaign.getId())
                .type(type)
                .severity(campaign.getStatus() == CampaignStatus.DRAFT ? "needs_action" : "info")
                .dueState(campaign.getStatus() == CampaignStatus.DRAFT ? "ready" : "waiting")
                .entityId(campaign.getId())
                .title(campaign.getTitle())
                .subtitle("Campaign is " + campaign.getStatus().name().toLowerCase(Locale.ROOT).replace('_', ' ') + ".")
                .primaryAction(action)
                .href("/campaigns/" + campaign.getId())
                .createdAt(toInstant(campaign.getCreatedAt()))
                .metadata(Map.of("status", campaign.getStatus().name()))
                .build();
    }

    private ActionQueueItemDTO mapKyc(KYCDocument document) {
        return ActionQueueItemDTO.builder()
                .id("kyc:" + document.getId())
                .type("kyc")
                .severity(ageSeverity(document.getCreatedAt(), 24, 12))
                .dueState(ageDueState(document.getCreatedAt(), 24, 12))
                .entityId(document.getId())
                .title("KYC waiting for " + displayName(document.getUser()))
                .subtitle(document.getDocumentType().name() + " document needs review.")
                .primaryAction("Review KYC")
                .href("/admin/kyc?documentId=" + document.getId())
                .createdAt(toInstant(document.getCreatedAt()))
                .metadata(Map.of("userId", document.getUser().getId(), "documentType", document.getDocumentType().name()))
                .build();
    }

    private ActionQueueItemDTO mapBrandVerification(BrandVerificationDocument document) {
        return ActionQueueItemDTO.builder()
                .id("brand_verification:" + document.getId())
                .type("brand_verification")
                .severity(ageSeverity(document.getSubmittedAt(), 24, 12))
                .dueState(ageDueState(document.getSubmittedAt(), 24, 12))
                .entityId(document.getId())
                .title("Verify " + displayName(document.getBrand()))
                .subtitle(document.getDocumentType() + " document is pending.")
                .primaryAction("Verify brand")
                .href("/admin/brands?verificationId=" + document.getId())
                .createdAt(toInstant(document.getSubmittedAt()))
                .metadata(Map.of("brandId", document.getBrand().getId()))
                .build();
    }

    private ActionQueueItemDTO mapAdminCampaign(Campaign campaign) {
        return ActionQueueItemDTO.builder()
                .id("campaign_review:" + campaign.getId())
                .type("campaign_review")
                .severity(ageSeverity(campaign.getCreatedAt(), 24, 12))
                .dueState(ageDueState(campaign.getCreatedAt(), 24, 12))
                .entityId(campaign.getId())
                .title("Campaign review: " + campaign.getTitle())
                .subtitle("Brand: " + displayName(campaign.getBrand()))
                .primaryAction("Approve or reject")
                .href("/admin/campaign-management/" + campaign.getId())
                .createdAt(toInstant(campaign.getCreatedAt()))
                .metadata(Map.of("brandId", campaign.getBrand().getId()))
                .build();
    }

    private ActionQueueItemDTO mapDispute(Dispute dispute) {
        return ActionQueueItemDTO.builder()
                .id("dispute:" + dispute.getId())
                .type("dispute")
                .severity(ageSeverity(dispute.getCreatedAt(), 48, 24))
                .dueState(ageDueState(dispute.getCreatedAt(), 48, 24))
                .entityId(dispute.getId())
                .title("Dispute from " + displayName(dispute.getCreator()))
                .subtitle(dispute.getCampaign() != null ? dispute.getCampaign().getTitle() : dispute.getType().name())
                .primaryAction("Assign or resolve")
                .href("/admin/disputes?disputeId=" + dispute.getId())
                .createdAt(toInstant(dispute.getCreatedAt()))
                .metadata(Map.of("brandId", dispute.getBrand().getId(), "creatorId", dispute.getCreator().getId()))
                .build();
    }

    private ActionQueueItemDTO mapCampaignFlag(CampaignFlag flag) {
        return ActionQueueItemDTO.builder()
                .id("campaign_flag:" + flag.getId())
                .type("campaign_flag")
                .severity("blocked")
                .dueState(ageDueState(flag.getCreatedAt(), 12, 6))
                .entityId(flag.getId())
                .title("Flagged campaign: " + flag.getCampaign().getTitle())
                .subtitle(flag.getReason())
                .primaryAction("Moderate campaign")
                .href("/admin/campaign-management/" + flag.getCampaign().getId())
                .createdAt(toInstant(flag.getCreatedAt()))
                .metadata(Map.of("campaignId", flag.getCampaign().getId()))
                .build();
    }

    private ActionQueueItemDTO mapWithdrawal(WithdrawalRequest request) {
        return ActionQueueItemDTO.builder()
                .id("payout:" + request.getId())
                .type("payout")
                .severity(ageSeverity(request.getRequestedAt(), 24, 12))
                .dueState(ageDueState(request.getRequestedAt(), 24, 12))
                .entityId(request.getId())
                .title("Payout waiting for " + displayName(request.getUser()))
                .subtitle("Amount: " + request.getAmount())
                .primaryAction("Review payout")
                .href("/admin/finance?payoutId=" + request.getId())
                .createdAt(toInstant(request.getRequestedAt()))
                .metadata(Map.of("userId", request.getUser().getId(), "amount", request.getAmount()))
                .build();
    }

    private String displayName(User user) {
        if (user == null) return "Unknown user";
        if (user.getBrandProfile() != null && user.getBrandProfile().getCompanyName() != null) {
            return user.getBrandProfile().getCompanyName();
        }
        if (user.getUserProfile() != null && user.getUserProfile().getFullName() != null) {
            return user.getUserProfile().getFullName();
        }
        return user.getEmail();
    }

    private String ageSeverity(LocalDateTime createdAt, long blockedAfterHours, long actionAfterHours) {
        long hours = hoursSince(createdAt);
        if (hours >= blockedAfterHours) return "blocked";
        if (hours >= actionAfterHours) return "needs_action";
        return "info";
    }

    private String ageDueState(LocalDateTime createdAt, long overdueAfterHours, long dueSoonAfterHours) {
        long hours = hoursSince(createdAt);
        if (hours >= overdueAfterHours) return "overdue";
        if (hours >= dueSoonAfterHours) return "due_soon";
        return "pending";
    }

    private long hoursSince(LocalDateTime dateTime) {
        if (dateTime == null) return 0;
        return ChronoUnit.HOURS.between(dateTime, LocalDateTime.now());
    }

    private Instant toInstant(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.toInstant(ZoneOffset.UTC);
    }

    private int severityRank(ActionQueueItemDTO item) {
        return switch (item.getSeverity() == null ? "" : item.getSeverity()) {
            case "blocked" -> 0;
            case "needs_action" -> 1;
            default -> 2;
        };
    }

    private String normalized(String actionType) {
        return actionType == null ? "" : actionType.trim().toUpperCase(Locale.ROOT).replace('-', '_');
    }

    private String required(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BusinessException(fieldName + " is required");
        }
        return value;
    }

    private <T> T timed(String operation, Supplier<T> supplier) {
        long start = System.nanoTime();
        try {
            return supplier.get();
        } finally {
            long durationMs = (System.nanoTime() - start) / 1_000_000;
            long targetMs = EnterpriseSlaTargets.targetMsForOperation(operation);
            Timer.builder("creatorx.enterprise.workflow.duration")
                    .description("Duration of enterprise workspace and workflow operations")
                    .tag("operation", operation)
                    .tag("target_ms", String.valueOf(targetMs))
                    .publishPercentiles(0.5, 0.95, 0.99)
                    .publishPercentileHistogram()
                    .register(meterRegistry)
                    .record(durationMs, TimeUnit.MILLISECONDS);
            if (durationMs > targetMs) {
                Counter.builder("creatorx.enterprise.workflow.sla_breach")
                        .description("Enterprise workflow operation exceeded its SLA target")
                        .tag("operation", operation)
                        .tag("target_ms", String.valueOf(targetMs))
                        .register(meterRegistry)
                        .increment();
                log.warn("workspace_operation={} duration_ms={} target_ms={} sla_breach=true", operation, durationMs, targetMs);
            } else {
                log.info("workspace_operation={} duration_ms={} target_ms={}", operation, durationMs, targetMs);
            }
        }
    }

    private void recordQueueDepth(String scope, String queue, String severity, long depth) {
        DistributionSummary.builder("creatorx.enterprise.queue.depth")
                .description("Observed enterprise queue depth by scope, queue, and severity")
                .baseUnit("items")
                .tag("scope", scope)
                .tag("queue", queue)
                .tag("severity", severity)
                .register(meterRegistry)
                .record(depth);
    }

    private void recordBulkActionMetrics(String actionType, int requested, int succeeded, int failed) {
        String normalizedAction = normalized(actionType);
        incrementBulkCounter("creatorx.enterprise.bulk_action.requested",
                "Enterprise bulk action requested item count", normalizedAction, requested);
        incrementBulkCounter("creatorx.enterprise.bulk_action.succeeded",
                "Enterprise bulk action succeeded item count", normalizedAction, succeeded);
        incrementBulkCounter("creatorx.enterprise.bulk_action.failed",
                "Enterprise bulk action failed item count", normalizedAction, failed);
    }

    private void incrementBulkCounter(String name, String description, String actionType, int amount) {
        if (amount <= 0) {
            return;
        }
        Counter.builder(name)
                .description(description)
                .tag("action_type", actionType)
                .register(meterRegistry)
                .increment(amount);
    }

    @FunctionalInterface
    private interface BulkOperation {
        Object apply(String entityId);
    }
}
