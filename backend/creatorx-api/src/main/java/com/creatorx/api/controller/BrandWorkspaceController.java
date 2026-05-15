package com.creatorx.api.controller;

import com.creatorx.api.dto.BulkActionRequest;
import com.creatorx.api.dto.PageResponse;
import com.creatorx.repository.entity.User;
import com.creatorx.service.EnterpriseWorkspaceService;
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
@RequestMapping("/api/v1/brand")
@RequiredArgsConstructor
@Tag(name = "Brand Workspace", description = "Enterprise brand workspace summary and unified action queue")
@SecurityRequirement(name = "bearerAuth")
public class BrandWorkspaceController {
    private final EnterpriseWorkspaceService enterpriseWorkspaceService;

    @GetMapping("/workspace-summary")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Brand workspace summary", description = "Returns priority counts, wallet blockers, campaign health, and top actions.")
    public WorkspaceSummaryDTO getWorkspaceSummary(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return enterpriseWorkspaceService.getBrandSummary(currentUser.getId());
    }

    @GetMapping("/action-queue")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Brand action queue", description = "Returns a paginated unified queue of brand work items.")
    public PageResponse<ActionQueueItemDTO> getActionQueue(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), Sort.by("createdAt").ascending());
        Page<ActionQueueItemDTO> queue = enterpriseWorkspaceService.getBrandActionQueue(currentUser.getId(), pageable);
        return PageResponse.from(queue);
    }

    @PostMapping("/bulk-actions")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Brand bulk actions", description = "Executes bulk application, deliverable, and campaign lifecycle actions.")
    public BulkActionResponseDTO executeBulkAction(
            @RequestBody BulkActionRequest request,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        return enterpriseWorkspaceService.executeBrandBulkAction(
                currentUser.getId(),
                request.getActionType(),
                request.getEntityIds(),
                request.getStatus(),
                request.getReason(),
                request.getFeedback()
        );
    }
}
