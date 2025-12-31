package com.creatorx.api.controller;

import com.creatorx.common.permissions.AdminPermissions;
import com.creatorx.api.dto.AdminFeedbackRequest;
import com.creatorx.api.dto.AdminSessionEventRequest;
import com.creatorx.service.admin.AdminEngagementService;
import com.creatorx.service.admin.AdminPermissionService;
import com.creatorx.service.admin.AdminSystemService;
import com.creatorx.service.dto.AdminSummaryDTO;
import com.creatorx.service.dto.SystemHealthSummaryDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/system")
@RequiredArgsConstructor
@Tag(name = "Admin System", description = "System health and metrics endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminSystemController {
    private final AdminSystemService adminSystemService;
    private final AdminPermissionService adminPermissionService;
    private final AdminEngagementService adminEngagementService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "System summary", description = "Get system health summary")
    public AdminSummaryDTO getSummary(Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_SYSTEM_READ);
        return adminSystemService.getSummary();
    }

    @GetMapping("/health")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "System health summary", description = "Get system health and metrics summary")
    public SystemHealthSummaryDTO getHealthSummary(Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_SYSTEM_READ);
        return adminSystemService.getHealthSummary();
    }

    @PostMapping("/session")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Track admin session", description = "Log admin session activity for DAU tracking")
    public ResponseEntity<Void> trackSession(
            @RequestBody(required = false) AdminSessionEventRequest request,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_SYSTEM_READ);
        adminEngagementService.recordSessionEvent(
                authentication.getName(),
                request != null ? request.getEventType() : null,
                request != null ? request.getPath() : null
        );
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/feedback")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Submit admin feedback", description = "Submit CSAT feedback from admin users")
    public ResponseEntity<Void> submitFeedback(
            @RequestBody AdminFeedbackRequest request,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_SYSTEM_READ);
        adminEngagementService.submitFeedback(authentication.getName(), request.getRating(), request.getComment());
        return ResponseEntity.noContent().build();
    }
}
