package com.creatorx.api.controller;

import com.creatorx.api.dto.CampaignFlagRequest;
import com.creatorx.api.dto.CampaignFlagResolveRequest;
import com.creatorx.common.enums.CampaignFlagStatus;
import com.creatorx.common.permissions.AdminPermissions;
import com.creatorx.service.admin.AdminPermissionService;
import com.creatorx.service.admin.ModerationService;
import com.creatorx.service.dto.CampaignFlagDTO;
import com.creatorx.service.dto.ModerationRuleDTO;
import com.creatorx.service.dto.ModerationRuleTestResultDTO;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/moderation")
@RequiredArgsConstructor
@Tag(name = "Admin Moderation", description = "Campaign moderation endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminModerationController {
    private final ModerationService moderationService;
    private final AdminPermissionService adminPermissionService;

    @GetMapping("/rules")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List moderation rules")
    public List<ModerationRuleDTO> listRules(Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_MODERATION_RULES);
        return moderationService.getRules();
    }

    @PostMapping("/rules")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create moderation rule")
    public ModerationRuleDTO createRule(@RequestBody ModerationRuleDTO request, Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_MODERATION_RULES);
        return moderationService.createRule(request);
    }

    @PutMapping("/rules/{ruleId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update moderation rule")
    public ModerationRuleDTO updateRule(
            @PathVariable String ruleId,
            @RequestBody ModerationRuleDTO request,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_MODERATION_RULES);
        return moderationService.updateRule(ruleId, request);
    }

    @DeleteMapping("/rules/{ruleId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete moderation rule")
    public void deleteRule(@PathVariable String ruleId, Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_MODERATION_RULES);
        moderationService.deleteRule(ruleId);
    }

    @GetMapping("/rules/{ruleId}/test")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Test moderation rule", description = "Run rule against recent campaigns")
    public ModerationRuleTestResultDTO testRule(
            @PathVariable String ruleId,
            @RequestParam(defaultValue = "50") int sampleSize,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_MODERATION_RULES);
        return moderationService.testRule(ruleId, sampleSize);
    }

    @GetMapping("/flags")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List campaign flags")
    public Page<CampaignFlagDTO> listFlags(
            @RequestParam(required = false) CampaignFlagStatus status,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MODERATION);
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "createdAt"));
        return moderationService.getFlags(status, pageable);
    }

    @PostMapping("/flags")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Flag campaign")
    public CampaignFlagDTO flagCampaign(
            @RequestBody CampaignFlagRequest request,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MODERATION);
        return moderationService.flagCampaign(request.getCampaignId(), request.getRuleId(), request.getReason(), authentication.getName());
    }

    @PutMapping("/flags/{flagId}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Resolve campaign flag")
    public CampaignFlagDTO resolveFlag(
            @PathVariable String flagId,
            @RequestBody CampaignFlagResolveRequest request,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MODERATION);
        return moderationService.resolveFlag(authentication.getName(), flagId, request.getStatus(), request.getNotes(), request.isRemoveCampaign());
    }
}
