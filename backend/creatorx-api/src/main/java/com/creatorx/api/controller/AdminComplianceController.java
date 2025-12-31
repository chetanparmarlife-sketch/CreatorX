package com.creatorx.api.controller;

import com.creatorx.api.dto.GDPRRequestUpdateRequest;
import com.creatorx.common.enums.GDPRRequestStatus;
import com.creatorx.common.enums.GDPRRequestType;
import com.creatorx.common.permissions.AdminPermissions;
import com.creatorx.service.admin.AdminPermissionService;
import com.creatorx.service.admin.ComplianceService;
import com.creatorx.service.dto.GDPRRequestDTO;
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
@RequestMapping("/api/v1/admin/compliance")
@RequiredArgsConstructor
@Tag(name = "Admin Compliance", description = "Compliance admin endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminComplianceController {
    private final ComplianceService complianceService;
    private final AdminPermissionService adminPermissionService;

    @GetMapping("/gdpr")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List GDPR requests (admin)")
    public Page<GDPRRequestDTO> listRequests(
            @RequestParam(required = false) GDPRRequestStatus status,
            @RequestParam(required = false) GDPRRequestType type,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_COMPLIANCE_MANAGE);
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "createdAt"));
        return complianceService.getRequests(status, type, pageable);
    }

    @PutMapping("/gdpr/{requestId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update GDPR request")
    public GDPRRequestDTO updateRequest(
            @PathVariable String requestId,
            @RequestBody GDPRRequestUpdateRequest request,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_COMPLIANCE_MANAGE);
        return complianceService.updateRequest(authentication.getName(), requestId, request.getStatus(), request.getExportUrl());
    }

    @PostMapping("/gdpr/{requestId}/export")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generate GDPR export")
    public GDPRRequestDTO generateExport(
            @PathVariable String requestId,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_COMPLIANCE_MANAGE);
        return complianceService.generateExport(authentication.getName(), requestId);
    }

    @PostMapping("/gdpr/{requestId}/anonymize")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Anonymize user for GDPR delete request")
    public GDPRRequestDTO anonymizeUser(
            @PathVariable String requestId,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_COMPLIANCE_MANAGE);
        return complianceService.anonymizeUser(authentication.getName(), requestId);
    }
}
