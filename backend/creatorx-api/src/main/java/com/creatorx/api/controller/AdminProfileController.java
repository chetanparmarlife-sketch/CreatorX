package com.creatorx.api.controller;

import com.creatorx.api.dto.UpdateBrandProfileRequest;
import com.creatorx.api.dto.UpdateCreatorProfileRequest;
import com.creatorx.api.dto.UpdateProfileRequest;
import com.creatorx.common.enums.AdminActionType;
import com.creatorx.common.permissions.AdminPermissions;
import com.creatorx.service.ProfileService;
import com.creatorx.service.admin.AdminAuditService;
import com.creatorx.service.admin.AdminPermissionService;
import com.creatorx.service.dto.BrandProfileDTO;
import com.creatorx.service.dto.CreatorProfileDTO;
import com.creatorx.service.dto.UserProfileDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/admin/profiles")
@RequiredArgsConstructor
@Tag(name = "Admin Profiles", description = "Admin profile edit endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminProfileController {
    private final ProfileService profileService;
    private final AdminPermissionService adminPermissionService;
    private final AdminAuditService adminAuditService;

    @PutMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user profile (admin)")
    public UserProfileDTO updateUserProfile(
            @PathVariable String userId,
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_USERS_WRITE);
        UserProfileDTO updated = profileService.updateProfile(
                userId,
                request.getFullName(),
                request.getPhone(),
                request.getBio()
        );

        HashMap<String, Object> details = new HashMap<>();
        details.put("fullName", request.getFullName());
        details.put("phone", request.getPhone());
        details.put("bio", request.getBio());

        adminAuditService.logAction(
                authentication.getName(),
                AdminActionType.SYSTEM_UPDATE,
                "USER_PROFILE",
                userId,
                details,
                null,
                null
        );

        return updated;
    }

    @PutMapping("/creator/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update creator profile (admin)")
    public CreatorProfileDTO updateCreatorProfile(
            @PathVariable String userId,
            @Valid @RequestBody UpdateCreatorProfileRequest request,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_USERS_WRITE);
        CreatorProfileDTO updated = profileService.updateCreatorProfile(
                userId,
                request.getUsername(),
                request.getCategory(),
                request.getInstagramUrl(),
                request.getYoutubeUrl(),
                request.getTwitterUrl()
        );

        HashMap<String, Object> details = new HashMap<>();
        details.put("username", request.getUsername());
        details.put("category", request.getCategory());
        details.put("instagramUrl", request.getInstagramUrl());
        details.put("youtubeUrl", request.getYoutubeUrl());
        details.put("twitterUrl", request.getTwitterUrl());

        adminAuditService.logAction(
                authentication.getName(),
                AdminActionType.SYSTEM_UPDATE,
                "CREATOR_PROFILE",
                userId,
                details,
                null,
                null
        );

        return updated;
    }

    @PutMapping("/brand/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update brand profile (admin)")
    public BrandProfileDTO updateBrandProfile(
            @PathVariable String userId,
            @Valid @RequestBody UpdateBrandProfileRequest request,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_USERS_WRITE);
        BrandProfileDTO updated = profileService.updateBrandProfile(
                userId,
                request.getCompanyName(),
                request.getGstNumber(),
                request.getIndustry(),
                request.getWebsite(),
                request.getCompanyDescription()
        );

        HashMap<String, Object> details = new HashMap<>();
        details.put("companyName", request.getCompanyName());
        details.put("gstNumber", request.getGstNumber());
        details.put("industry", request.getIndustry());
        details.put("website", request.getWebsite());
        details.put("companyDescription", request.getCompanyDescription());

        adminAuditService.logAction(
                authentication.getName(),
                AdminActionType.SYSTEM_UPDATE,
                "BRAND_PROFILE",
                userId,
                details,
                null,
                null
        );

        return updated;
    }
}
