package com.creatorx.api.controller;

import com.creatorx.repository.entity.User;
import com.creatorx.service.CampaignAnalyticsService;
import com.creatorx.service.dto.CampaignAnalyticsDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/campaigns")
@Tag(name = "Campaign Analytics", description = "Campaign analytics and statistics for brands")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class CampaignAnalyticsController {
    
    private final CampaignAnalyticsService campaignAnalyticsService;
    
    /**
     * Get campaign analytics
     */
    @GetMapping("/{id}/analytics")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Get campaign analytics", description = "Get analytics data for a campaign (Brand only, own campaigns)")
    public ResponseEntity<CampaignAnalyticsDTO> getCampaignAnalytics(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "30d") String range
    ) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication required");
        }
        CampaignAnalyticsDTO analytics = campaignAnalyticsService.getCampaignAnalytics(id, currentUser, range);
        return ResponseEntity.ok(analytics);
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

