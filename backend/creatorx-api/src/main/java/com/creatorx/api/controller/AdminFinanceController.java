package com.creatorx.api.controller;

import com.creatorx.common.enums.FinanceReportPeriod;
import com.creatorx.common.enums.TransactionStatus;
import com.creatorx.common.enums.TransactionType;
import com.creatorx.common.permissions.AdminPermissions;
import com.creatorx.service.admin.AdminFinanceService;
import com.creatorx.service.admin.AdminPermissionService;
import com.creatorx.service.dto.FinanceCampaignReportRowDTO;
import com.creatorx.service.dto.FinancePeriodReportRowDTO;
import com.creatorx.service.dto.FinanceSummaryDTO;
import com.creatorx.service.dto.FinanceUserReportRowDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/finance")
@RequiredArgsConstructor
@Tag(name = "Admin Finance", description = "Financial reconciliation endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminFinanceController {
    private final AdminFinanceService adminFinanceService;
    private final AdminPermissionService adminPermissionService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Finance summary", description = "Get financial reconciliation summary")
    public FinanceSummaryDTO getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_FINANCE_READ);
        return adminFinanceService.getSummary(from, to);
    }

    @GetMapping("/reports/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Finance report by user")
    public List<FinanceUserReportRowDTO> getUserReport(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) TransactionStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_FINANCE_READ);
        return adminFinanceService.getUserReport(type, status, from, to);
    }

    @GetMapping("/reports/campaigns")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Finance report by campaign")
    public List<FinanceCampaignReportRowDTO> getCampaignReport(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) TransactionStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_FINANCE_READ);
        return adminFinanceService.getCampaignReport(type, status, from, to);
    }

    @GetMapping("/reports/period")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Finance report by period")
    public List<FinancePeriodReportRowDTO> getPeriodReport(
            @RequestParam(required = false) FinanceReportPeriod period,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) TransactionStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_FINANCE_READ);
        return adminFinanceService.getPeriodReport(period, type, status, from, to);
    }

    @GetMapping(value = "/reports/export", produces = "text/csv")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export finance report CSV")
    public ResponseEntity<byte[]> exportReport(
            @RequestParam String groupBy,
            @RequestParam(required = false) FinanceReportPeriod period,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) TransactionStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "false") boolean includeFlags,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_FINANCE_READ);
        String csv = switch (groupBy.toUpperCase()) {
            case "USER", "USERS" -> adminFinanceService.exportUserReportCsv(type, status, from, to, includeFlags);
            case "CAMPAIGN", "CAMPAIGNS" -> adminFinanceService.exportCampaignReportCsv(type, status, from, to, includeFlags);
            default -> adminFinanceService.exportPeriodReportCsv(period, type, status, from, to, includeFlags);
        };
        byte[] payload = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"finance-report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(payload);
    }
}
