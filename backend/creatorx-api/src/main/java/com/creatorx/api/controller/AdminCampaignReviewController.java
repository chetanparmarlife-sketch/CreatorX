package com.creatorx.api.controller;

import com.creatorx.api.dto.CampaignReviewRequest;
import com.creatorx.common.permissions.AdminPermissions;
import com.creatorx.service.admin.AdminCampaignReviewService;
import com.creatorx.service.admin.AdminPermissionService;
import com.creatorx.service.dto.CampaignDTO;
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
@RequestMapping("/api/v1/admin/campaigns")
@RequiredArgsConstructor
@Tag(name = "Admin Campaign Review", description = "Campaign pre-approval review")
@SecurityRequirement(name = "bearerAuth")
public class AdminCampaignReviewController {
    private final AdminCampaignReviewService adminCampaignReviewService;
    private final AdminPermissionService adminPermissionService;

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List pending campaigns", description = "List campaigns awaiting pre-approval review")
    public Page<CampaignDTO> listPending(
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_REVIEW);
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "createdAt"));
        return adminCampaignReviewService.listPending(pageable);
    }

    @PutMapping("/{campaignId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve campaign", description = "Approve campaign for public listing")
    public CampaignDTO approveCampaign(
            @PathVariable String campaignId,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_REVIEW);
        return adminCampaignReviewService.approveCampaign(authentication.getName(), campaignId);
    }

    @PutMapping("/{campaignId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject campaign", description = "Reject campaign with reason")
    public CampaignDTO rejectCampaign(
            @PathVariable String campaignId,
            @RequestBody CampaignReviewRequest request,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_REVIEW);
        return adminCampaignReviewService.rejectCampaign(authentication.getName(), campaignId, request.getReason());
    }

    @PutMapping("/{campaignId}/escalate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Escalate campaign", description = "Escalate a pending campaign for senior moderation review")
    public CampaignDTO escalateCampaign(
            @PathVariable String campaignId,
            @RequestBody CampaignReviewRequest request,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_REVIEW);
        return adminCampaignReviewService.escalateCampaign(authentication.getName(), campaignId, request.getReason());
    }
}
