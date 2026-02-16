package com.creatorx.api.controller;

import com.creatorx.repository.entity.User;
import com.creatorx.service.MediaKitService;
import com.creatorx.service.dto.MediaKitDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Media Kit operations
 */
@RestController
@RequestMapping("/api/v1")
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
    public ResponseEntity<MediaKitDTO> getMyMediaKit(Authentication authentication) {
        String userId = getAuthenticatedUserId(authentication);
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
            Authentication authentication,
            @RequestBody MediaKitDTO dto) {
        String userId = getAuthenticatedUserId(authentication);
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
            Authentication authentication,
            @RequestBody MediaKitDTO dto) {
        String userId = getAuthenticatedUserId(authentication);
        log.debug("Updating pricing for user: {}", userId);

        MediaKitDTO updated = mediaKitService.updatePricing(userId, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Refresh social stats from connected accounts
     */
    @PostMapping("/creators/media-kit/refresh-stats")
    @Operation(summary = "Refresh social stats")
    public ResponseEntity<MediaKitDTO> refreshSocialStats(Authentication authentication) {
        String userId = getAuthenticatedUserId(authentication);
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
            Authentication authentication,
            @RequestParam boolean isPublic) {
        String userId = getAuthenticatedUserId(authentication);
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
    public ResponseEntity<Void> deleteMediaKit(Authentication authentication) {
        String userId = getAuthenticatedUserId(authentication);
        log.debug("Deleting media kit for user: {}", userId);

        mediaKitService.deleteMediaKit(userId);
        return ResponseEntity.noContent().build();
    }

    private String getAuthenticatedUserId(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }
}
