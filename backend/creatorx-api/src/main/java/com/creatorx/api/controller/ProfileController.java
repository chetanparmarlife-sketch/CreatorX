package com.creatorx.api.controller;

import com.creatorx.api.dto.AvatarResponse;
import com.creatorx.api.dto.PortfolioItemRequest;
import com.creatorx.api.dto.UpdateBrandProfileRequest;
import com.creatorx.api.dto.UpdateCreatorProfileRequest;
import com.creatorx.api.dto.UpdateProfileRequest;
import com.creatorx.common.enums.UserRole;
import com.creatorx.repository.entity.User;
import com.creatorx.service.ProfileService;
import com.creatorx.service.dto.BrandProfileDTO;
import com.creatorx.service.dto.CreatorProfileDTO;
import com.creatorx.service.dto.PortfolioItem;
import com.creatorx.service.dto.UserProfileDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/profile")
@Tag(name = "Profile", description = "User profile management endpoints")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ProfileController {

    private final ProfileService profileService;

    /**
     * Get user profile
     * For brands, returns brand profile. For creators, returns user profile.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get profile", description = "Get current user's profile. For brands, returns brand profile.")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        String userId = user.getId();

        if (user.getRole() == UserRole.BRAND) {
            // Return brand profile
            BrandProfileDTO brandProfile = profileService.getBrandProfile(userId);
            return ResponseEntity.ok(brandProfile);
        } else {
            // Return user profile
            UserProfileDTO profile = profileService.getProfile(userId);
            return ResponseEntity.ok(profile);
        }
    }

    /**
     * Update user profile
     */
    @PutMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update profile", description = "Update current user's profile")
    public ResponseEntity<UserProfileDTO> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        String userId = ((User) authentication.getPrincipal()).getId();
        UserProfileDTO profile = profileService.updateProfile(
                userId,
                request.getFullName(),
                request.getPhone(),
                request.getBio());
        return ResponseEntity.ok(profile);
    }

    /**
     * Upload avatar
     */
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload avatar", description = "Upload user profile avatar")
    public ResponseEntity<AvatarResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        String userId = ((User) authentication.getPrincipal()).getId();
        String avatarUrl = profileService.uploadAvatar(userId, file);
        return ResponseEntity.ok(AvatarResponse.builder().avatarUrl(avatarUrl).build());
    }

    /**
     * Upload logo (alias for avatar, for brand compatibility)
     */
    @PostMapping(value = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Upload logo", description = "Upload brand logo (alias for avatar)")
    public ResponseEntity<AvatarResponse> uploadLogo(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        String userId = ((User) authentication.getPrincipal()).getId();
        String avatarUrl = profileService.uploadAvatar(userId, file);
        return ResponseEntity.ok(AvatarResponse.builder().avatarUrl(avatarUrl).build());
    }

    /**
     * Get creator profile
     */
    @GetMapping("/creator")
    @PreAuthorize("hasRole('CREATOR')")
    @Operation(summary = "Get creator profile", description = "Get creator profile (Creator only)")
    public ResponseEntity<CreatorProfileDTO> getCreatorProfile(Authentication authentication) {
        String userId = ((User) authentication.getPrincipal()).getId();
        CreatorProfileDTO profile = profileService.getCreatorProfile(userId);
        return ResponseEntity.ok(profile);
    }

    /**
     * Update creator profile
     */
    @PutMapping("/creator")
    @PreAuthorize("hasRole('CREATOR')")
    @Operation(summary = "Update creator profile", description = "Update creator profile (Creator only)")
    public ResponseEntity<CreatorProfileDTO> updateCreatorProfile(
            @Valid @RequestBody UpdateCreatorProfileRequest request,
            Authentication authentication) {
        String userId = ((User) authentication.getPrincipal()).getId();
        CreatorProfileDTO profile = profileService.updateCreatorProfile(
                userId,
                request.getUsername(),
                request.getCategory(),
                request.getInstagramUrl(),
                request.getYoutubeUrl(),
                request.getTwitterUrl());
        return ResponseEntity.ok(profile);
    }

    /**
     * Get portfolio items
     */
    @GetMapping("/portfolio")
    @PreAuthorize("hasRole('CREATOR')")
    @Operation(summary = "Get portfolio", description = "Get creator portfolio items (Creator only)")
    public ResponseEntity<List<PortfolioItem>> getPortfolio(Authentication authentication) {
        String userId = ((User) authentication.getPrincipal()).getId();
        List<PortfolioItem> portfolio = profileService.getPortfolio(userId);
        return ResponseEntity.ok(portfolio);
    }

    /**
     * Add portfolio item.
     * Accepts either 'media' (web) or 'file' (mobile) field for the content.
     */
    @PostMapping(value = "/portfolio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CREATOR')")
    @Operation(summary = "Add portfolio item", description = "Add item to creator portfolio (Creator only)")
    public ResponseEntity<PortfolioItem> addPortfolioItem(
            @RequestPart("title") String title,
            @RequestPart(value = "description", required = false) String description,
            @RequestPart(value = "media", required = false) MultipartFile media,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication authentication) {
        // Use 'file' if provided (mobile), otherwise use 'media' (web)
        MultipartFile mediaFile = (file != null && !file.isEmpty()) ? file : media;
        if (mediaFile == null || mediaFile.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        String userId = ((User) authentication.getPrincipal()).getId();
        PortfolioItem item = profileService.addPortfolioItem(userId, title, description, mediaFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    /**
     * Delete portfolio item
     */
    @DeleteMapping("/portfolio/{itemId}")
    @PreAuthorize("hasRole('CREATOR')")
    @Operation(summary = "Delete portfolio item", description = "Delete portfolio item (Creator only)")
    public ResponseEntity<Void> deletePortfolioItem(
            @PathVariable String itemId,
            Authentication authentication) {
        String userId = ((User) authentication.getPrincipal()).getId();
        profileService.deletePortfolioItem(userId, itemId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get brand profile
     */
    @GetMapping("/brand")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Get brand profile", description = "Get brand profile (Brand only)")
    public ResponseEntity<BrandProfileDTO> getBrandProfile(Authentication authentication) {
        String userId = ((User) authentication.getPrincipal()).getId();
        BrandProfileDTO profile = profileService.getBrandProfile(userId);
        return ResponseEntity.ok(profile);
    }

    /**
     * Update brand profile
     */
    @PutMapping("/brand")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Update brand profile", description = "Update brand profile (Brand only)")
    public ResponseEntity<BrandProfileDTO> updateBrandProfile(
            @Valid @RequestBody UpdateBrandProfileRequest request,
            Authentication authentication) {
        String userId = ((User) authentication.getPrincipal()).getId();
        BrandProfileDTO profile = profileService.updateBrandProfile(
                userId,
                request.getCompanyName(),
                request.getGstNumber(),
                request.getIndustry(),
                request.getWebsite(),
                request.getCompanyDescription());
        return ResponseEntity.ok(profile);
    }
}
