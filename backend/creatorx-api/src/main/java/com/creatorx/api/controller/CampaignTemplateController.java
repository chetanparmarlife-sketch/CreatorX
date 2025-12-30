package com.creatorx.api.controller;

import com.creatorx.repository.entity.User;
import com.creatorx.service.CampaignTemplateService;
import com.creatorx.service.dto.CampaignTemplateDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/campaign-templates")
@Tag(name = "Campaign Templates", description = "Campaign templates for brands")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class CampaignTemplateController {
    private final CampaignTemplateService templateService;

    @GetMapping
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "List campaign templates", description = "List templates owned by the brand")
    public ResponseEntity<List<CampaignTemplateDTO>> getTemplates() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(templateService.getTemplates(currentUser.getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Get campaign template", description = "Get template details")
    public ResponseEntity<CampaignTemplateDTO> getTemplate(@PathVariable String id) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(templateService.getTemplate(currentUser.getId(), id));
    }

    @PostMapping
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Create campaign template", description = "Create a new campaign template")
    public ResponseEntity<CampaignTemplateDTO> createTemplate(@Valid @RequestBody CampaignTemplateDTO request) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(templateService.createTemplate(currentUser.getId(), request));
    }

    @PostMapping("/from-campaign/{campaignId}")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Create template from campaign", description = "Clone a campaign into a template")
    public ResponseEntity<CampaignTemplateDTO> createFromCampaign(@PathVariable String campaignId) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(templateService.createTemplateFromCampaign(currentUser.getId(), campaignId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Update campaign template", description = "Update an existing campaign template")
    public ResponseEntity<CampaignTemplateDTO> updateTemplate(
            @PathVariable String id,
            @Valid @RequestBody CampaignTemplateDTO request
    ) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(templateService.updateTemplate(currentUser.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Delete campaign template", description = "Delete a campaign template")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        User currentUser = getCurrentUser();
        templateService.deleteTemplate(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication required");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        log.warn("Authentication principal is not a User instance: {}", principal != null ? principal.getClass() : "null");
        throw new org.springframework.security.access.AccessDeniedException("Invalid authentication principal");
    }
}
