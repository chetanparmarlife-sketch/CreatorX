package com.creatorx.api.controller;

import com.creatorx.service.MediaKitService;
import com.creatorx.service.dto.MediaKitDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Media Kit operations
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Media Kit", description = "Media Kit management endpoints")
public class MediaKitController {

    private final MediaKitService mediaKitService;

    /**
     * Get current user's media kit
     */
    @GetMapping("/creators/media-kit")
    @Operation(summary = "Get current user's media kit")
    public ResponseEntity<MediaKitDTO> getMyMediaKit(
            @AuthenticationPrincipal UserDetails userDetails) {
        String userId = userDetails.getUsername();
        log.debug("Getting media kit for user: {}", userId);

        return mediaKitService.getMediaKit(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create or update current user's media kit
     */
    @PutMapping("/creators/media-kit")
    @Operation(summary = "Create or update media kit")
    public ResponseEntity<MediaKitDTO> saveMediaKit(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody MediaKitDTO dto) {
        String userId = userDetails.getUsername();
        log.debug("Saving media kit for user: {}", userId);

        MediaKitDTO saved = mediaKitService.saveMediaKit(userId, dto);
        return ResponseEntity.ok(saved);
    }

    /**
     * Update pricing rates only
     */
    @PatchMapping("/creators/media-kit/pricing")
    @Operation(summary = "Update pricing rates")
    public ResponseEntity<MediaKitDTO> updatePricing(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody MediaKitDTO dto) {
        String userId = userDetails.getUsername();
        log.debug("Updating pricing for user: {}", userId);

        MediaKitDTO updated = mediaKitService.updatePricing(userId, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Refresh social stats from connected accounts
     */
    @PostMapping("/creators/media-kit/refresh-stats")
    @Operation(summary = "Refresh social stats")
    public ResponseEntity<MediaKitDTO> refreshSocialStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        String userId = userDetails.getUsername();
        log.debug("Refreshing social stats for user: {}", userId);

        MediaKitDTO refreshed = mediaKitService.refreshSocialStats(userId);
        return ResponseEntity.ok(refreshed);
    }

    /**
     * Toggle media kit visibility
     */
    @PatchMapping("/creators/media-kit/visibility")
    @Operation(summary = "Toggle visibility")
    public ResponseEntity<MediaKitDTO> toggleVisibility(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam boolean isPublic) {
        String userId = userDetails.getUsername();
        log.debug("Setting visibility to {} for user: {}", isPublic, userId);

        MediaKitDTO updated = mediaKitService.toggleVisibility(userId, isPublic);
        return ResponseEntity.ok(updated);
    }

    /**
     * Get public media kit by creator ID
     */
    @GetMapping("/creators/{creatorId}/media-kit")
    @Operation(summary = "Get public media kit by creator ID")
    public ResponseEntity<MediaKitDTO> getPublicMediaKit(
            @PathVariable String creatorId) {
        log.debug("Getting public media kit for creator: {}", creatorId);

        return mediaKitService.getPublicMediaKit(creatorId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete media kit
     */
    @DeleteMapping("/creators/media-kit")
    @Operation(summary = "Delete media kit")
    public ResponseEntity<Void> deleteMediaKit(
            @AuthenticationPrincipal UserDetails userDetails) {
        String userId = userDetails.getUsername();
        log.debug("Deleting media kit for user: {}", userId);

        mediaKitService.deleteMediaKit(userId);
        return ResponseEntity.noContent().build();
    }
}
