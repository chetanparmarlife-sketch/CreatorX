package com.creatorx.api.controller;

import com.creatorx.api.dto.AddToShortlistRequest;
import com.creatorx.repository.entity.User;
import com.creatorx.service.BrandListService;
import com.creatorx.service.dto.BrandListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * BrandListController.
 *
 * REST endpoints for shared brand creator shortlists. The brand dashboard uses
 * these endpoints to store shortlisted creators in the database instead of
 * browser localStorage, making lists available across devices and team members.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/brands/lists")
@Tag(name = "Brand Lists", description = "Creator shortlist management for brands")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class BrandListController {
    private final BrandListService brandListService;

    /**
     * Get all creator lists for the authenticated brand.
     */
    @GetMapping
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Get brand lists", description = "Get all creator lists for the authenticated brand")
    public ResponseEntity<List<BrandListResponse>> getLists(
            @RequestParam(required = false) String campaignId,
            Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        List<BrandListResponse> lists = brandListService.getLists(currentUser.getId(), campaignId);
        return ResponseEntity.ok(lists);
    }

    /**
     * Add a creator to the authenticated brand's shortlist.
     */
    @PostMapping("/shortlist")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Add creator to shortlist", description = "Add a creator to a shared brand shortlist")
    public ResponseEntity<BrandListResponse> addToShortlist(
            @Valid @RequestBody AddToShortlistRequest request,
            Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        BrandListResponse result = brandListService.addToShortlist(
                currentUser.getId(),
                request.getCreatorId(),
                request.getCampaignId(),
                request.getListName());
        return ResponseEntity.ok(result);
    }

    /**
     * Remove a creator from the authenticated brand's shortlist.
     */
    @DeleteMapping("/shortlist/{creatorId}")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Remove creator from shortlist", description = "Remove a creator from a shared brand shortlist")
    public ResponseEntity<Void> removeFromShortlist(
            @PathVariable String creatorId,
            @RequestParam(required = false) String campaignId,
            Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        brandListService.removeFromShortlist(currentUser.getId(), creatorId, campaignId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Extract the authenticated User principal using the same pattern as the
     * existing campaign, application, and wallet controllers.
     */
    private User getCurrentUser(Authentication authentication) {
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
