package com.creatorx.service.admin;

import com.creatorx.common.enums.AdminActionType;
import com.creatorx.common.enums.ComplianceReportStatus;
import com.creatorx.common.enums.ComplianceReportType;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.ComplianceReportRepository;
import com.creatorx.repository.TransactionRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.ComplianceReport;
import com.creatorx.repository.entity.Transaction;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.ComplianceReportDTO;
import com.creatorx.service.storage.SupabaseStorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplianceReportService {
    private final ComplianceReportRepository complianceReportRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final SupabaseStorageService storageService;
    private final ObjectMapper objectMapper;
    private final AdminAuditService adminAuditService;

    @Transactional(readOnly = true)
    public Page<ComplianceReportDTO> listReports(
            ComplianceReportType type,
            ComplianceReportStatus status,
            String region,
            Pageable pageable
    ) {
        Specification<ComplianceReport> spec = Specification.where(null);
        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("reportType"), type));
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (region != null && !region.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("region")), region.toLowerCase()));
        }
        return complianceReportRepository.findAll(spec, pageable)
                .map(this::toDTO);
    }

    @Transactional
    public ComplianceReportDTO generateTaxDocument(String adminId, String region, LocalDateTime periodStart, LocalDateTime periodEnd) {
        return generateReport(adminId, ComplianceReportType.TAX_DOCUMENT, region, periodStart, periodEnd);
    }

    @Transactional
    public ComplianceReportDTO generateRegulatoryExport(String adminId, String region, LocalDateTime periodStart, LocalDateTime periodEnd) {
        return generateReport(adminId, ComplianceReportType.REGULATORY_EXPORT, region, periodStart, periodEnd);
    }

    private ComplianceReportDTO generateReport(
            String adminId,
            ComplianceReportType type,
            String region,
            LocalDateTime periodStart,
            LocalDateTime periodEnd
    ) {
        User admin = requireAdmin(adminId);
        if (region == null || region.isBlank()) {
            throw new BusinessException("Region is required");
        }
        if (periodStart != null && periodEnd != null && periodEnd.isBefore(periodStart)) {
            throw new BusinessException("Period end must be after period start");
        }

        complianceReportRepository.findExisting(type, region, periodStart, periodEnd)
                .ifPresent(existing -> {
                    throw new BusinessException("Report already exists for the selected period");
                });

        ComplianceReport report = ComplianceReport.builder()
                .reportType(type)
                .region(region)
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .status(ComplianceReportStatus.PENDING)
                .generatedBy(admin)
                .build();
        report = complianceReportRepository.save(report);

        Map<String, Object> payload = buildReportPayload(type, region, periodStart, periodEnd);
        byte[] content;
        try {
            content = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(payload);
        } catch (Exception e) {
            throw new BusinessException("Failed to serialize report data: " + e.getMessage());
        }

        String fileName = String.format("%s-%s-%s.json", type.name().toLowerCase(), region.toLowerCase(), UUID.randomUUID());
        var upload = storageService.uploadExport(fileName, content, "application/json");
        String signedUrl = storageService.generateSignedUrl(upload.getFileUrl(), 7 * 24 * 3600).getSignedUrl();

        report.setStatus(ComplianceReportStatus.COMPLETED);
        report.setFileUrl(upload.getFileUrl());
        report.setGeneratedAt(LocalDateTime.now());
        report.setDetailsJson(Map.of(
                "recordCount", payload.getOrDefault("recordCount", 0),
                "signedUrl", signedUrl
        ));

        ComplianceReport saved = complianceReportRepository.save(report);

        adminAuditService.logAction(
                adminId,
                AdminActionType.SYSTEM_UPDATE,
                type == ComplianceReportType.TAX_DOCUMENT ? "TAX_REPORT" : "REGULATORY_REPORT",
                saved.getId(),
                Map.of(
                        "region", region,
                        "periodStart", periodStart,
                        "periodEnd", periodEnd
                ),
                null,
                null
        );

        return toDTO(saved, signedUrl);
    }

    private Map<String, Object> buildReportPayload(
            ComplianceReportType type,
            String region,
            LocalDateTime periodStart,
            LocalDateTime periodEnd
    ) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", type.name());
        payload.put("region", region);
        payload.put("periodStart", periodStart);
        payload.put("periodEnd", periodEnd);

        LocalDateTime start = periodStart != null ? periodStart : LocalDateTime.now().minusDays(30);
        LocalDateTime end = periodEnd != null ? periodEnd : LocalDateTime.now();
        List<Transaction> transactions = transactionRepository.findByCreatedAtBetween(start, end);

        payload.put("recordCount", transactions.size());
        payload.put("transactions", transactions.stream().map(txn -> Map.of(
                "id", txn.getId(),
                "type", txn.getType(),
                "status", txn.getStatus(),
                "amount", txn.getAmount(),
                "createdAt", txn.getCreatedAt(),
                "userId", txn.getUser() != null ? txn.getUser().getId() : null,
                "campaignId", txn.getCampaign() != null ? txn.getCampaign().getId() : null
        )).toList());

        return payload;
    }

    private ComplianceReportDTO toDTO(ComplianceReport report) {
        String signedUrl = null;
        if (report.getFileUrl() != null) {
            signedUrl = storageService.generateSignedUrl(report.getFileUrl(), 24 * 3600).getSignedUrl();
        }
        return toDTO(report, signedUrl);
    }

    private ComplianceReportDTO toDTO(ComplianceReport report, String signedUrl) {
        return ComplianceReportDTO.builder()
                .id(report.getId())
                .reportType(report.getReportType())
                .status(report.getStatus())
                .region(report.getRegion())
                .periodStart(report.getPeriodStart())
                .periodEnd(report.getPeriodEnd())
                .fileUrl(report.getFileUrl())
                .signedUrl(signedUrl)
                .details(report.getDetailsJson())
                .generatedBy(report.getGeneratedBy() != null ? report.getGeneratedBy().getId() : null)
                .generatedAt(report.getGeneratedAt())
                .createdAt(report.getCreatedAt())
                .build();
    }

    private User requireAdmin(String adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));
        if (admin.getRole() != UserRole.ADMIN) {
            throw new BusinessException("Only admins can generate compliance reports");
        }
        return admin;
    }
}
