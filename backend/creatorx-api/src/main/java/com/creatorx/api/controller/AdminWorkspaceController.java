package com.creatorx.api.controller;

import com.creatorx.api.dto.BulkActionRequest;
import com.creatorx.api.dto.PageResponse;
import com.creatorx.common.permissions.AdminPermissions;
import com.creatorx.service.EnterpriseWorkspaceService;
import com.creatorx.service.admin.AdminPermissionService;
import com.creatorx.service.dto.ActionQueueItemDTO;
import com.creatorx.service.dto.BulkActionResponseDTO;
import com.creatorx.service.dto.WorkspaceSummaryDTO;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Workspace", description = "Enterprise admin workspace summary and unified action queue")
@SecurityRequirement(name = "bearerAuth")
public class AdminWorkspaceController {
    private final EnterpriseWorkspaceService enterpriseWorkspaceService;
    private final AdminPermissionService adminPermissionService;

    @GetMapping("/workspace-summary")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin workspace summary", description = "Returns operational queues, SLA breaches, payout alerts, and system health.")
    public WorkspaceSummaryDTO getWorkspaceSummary() {
        return enterpriseWorkspaceService.getAdminSummary();
    }

    @GetMapping("/action-queue")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin action queue", description = "Returns a paginated unified queue of admin work items.")
    public PageResponse<ActionQueueItemDTO> getActionQueue(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), Sort.by("createdAt").ascending());
        Page<ActionQueueItemDTO> queue = enterpriseWorkspaceService.getAdminActionQueue(pageable);
        return PageResponse.from(queue);
    }

    @PostMapping("/bulk-actions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin bulk actions", description = "Executes bulk KYC, brand verification, and campaign moderation actions.")
    public BulkActionResponseDTO executeBulkAction(
            @RequestBody BulkActionRequest request,
            Authentication authentication
    ) {
        requireBulkActionPermission(authentication, request.getActionType());
        return enterpriseWorkspaceService.executeAdminBulkAction(
                authentication.getName(),
                request.getActionType(),
                request.getEntityIds(),
                request.getStatus(),
                request.getReason()
        );
    }

    private void requireBulkActionPermission(Authentication authentication, String actionType) {
        String normalized = actionType == null ? "" : actionType.trim().toUpperCase().replace('-', '_');
        switch (normalized) {
            case "KYC_REVIEW" ->
                    adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_KYC_REVIEW);
            case "BRAND_VERIFICATION" ->
                    adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_BRAND_VERIFICATION_REVIEW);
            case "CAMPAIGN_MODERATION" ->
                    adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_REVIEW);
            default -> {
                // Let the service return the unsupported-action response consistently.
            }
        }
    }
}
