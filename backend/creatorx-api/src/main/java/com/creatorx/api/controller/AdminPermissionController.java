package com.creatorx.api.controller;

import com.creatorx.api.dto.AdminPermissionsRequest;
import com.creatorx.common.permissions.AdminPermissions;
import com.creatorx.service.admin.AdminPermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/permissions")
@RequiredArgsConstructor
@Tag(name = "Admin Permissions", description = "Admin permission management")
@SecurityRequirement(name = "bearerAuth")
public class AdminPermissionController {
    private final AdminPermissionService adminPermissionService;

    @GetMapping("/{adminId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List admin permissions")
    public List<String> listPermissions(@PathVariable String adminId, Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_PERMISSIONS_MANAGE);
        return adminPermissionService.getPermissions(adminId);
    }

    @PutMapping("/{adminId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Replace admin permissions")
    public void replacePermissions(
            @PathVariable String adminId,
            @RequestBody AdminPermissionsRequest request,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_PERMISSIONS_MANAGE);
        adminPermissionService.replacePermissions(adminId, request.getPermissions());
    }

    @PostMapping("/{adminId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Grant admin permission")
    public void grantPermission(
            @PathVariable String adminId,
            @RequestParam String permission,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_PERMISSIONS_MANAGE);
        adminPermissionService.grantPermission(adminId, permission);
    }

    @DeleteMapping("/{adminId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Revoke admin permission")
    public void revokePermission(
            @PathVariable String adminId,
            @RequestParam String permission,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_PERMISSIONS_MANAGE);
        adminPermissionService.revokePermission(adminId, permission);
    }
}
