package com.creatorx.api.controller;

import com.creatorx.api.dto.ComplianceReportGenerateRequest;
import com.creatorx.common.enums.ComplianceReportStatus;
import com.creatorx.common.enums.ComplianceReportType;
import com.creatorx.common.permissions.AdminPermissions;
import com.creatorx.service.admin.AdminPermissionService;
import com.creatorx.service.admin.ComplianceReportService;
import com.creatorx.service.dto.ComplianceReportDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/compliance/reports")
@RequiredArgsConstructor
@Tag(name = "Admin Compliance Reports", description = "Compliance tax and regulatory reports")
@SecurityRequirement(name = "bearerAuth")
public class AdminComplianceReportController {
    private final ComplianceReportService complianceReportService;
    private final AdminPermissionService adminPermissionService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List compliance reports")
    public Page<ComplianceReportDTO> listReports(
            @RequestParam(required = false) ComplianceReportType type,
            @RequestParam(required = false) ComplianceReportStatus status,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_COMPLIANCE_MANAGE);
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "createdAt"));
        return complianceReportService.listReports(type, status, region, pageable);
    }

    @PostMapping("/tax")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generate tax document report")
    public ComplianceReportDTO generateTaxReport(
            @RequestBody ComplianceReportGenerateRequest request,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_COMPLIANCE_MANAGE);
        return complianceReportService.generateTaxDocument(
                authentication.getName(),
                request.getRegion(),
                request.getPeriodStart(),
                request.getPeriodEnd()
        );
    }

    @PostMapping("/regulatory")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generate regulatory export report")
    public ComplianceReportDTO generateRegulatoryReport(
            @RequestBody ComplianceReportGenerateRequest request,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_COMPLIANCE_MANAGE);
        return complianceReportService.generateRegulatoryExport(
                authentication.getName(),
                request.getRegion(),
                request.getPeriodStart(),
                request.getPeriodEnd()
        );
    }
}
