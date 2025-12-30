package com.creatorx.api.controller;

import com.creatorx.api.dto.AdminUserStatusRequest;
import com.creatorx.api.dto.AppealResolveRequest;
import com.creatorx.common.enums.AppealStatus;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.enums.UserStatus;
import com.creatorx.service.admin.AdminUserService;
import com.creatorx.service.dto.AccountAppealDTO;
import com.creatorx.service.dto.AdminUserDTO;
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
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin Users", description = "Admin user management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminUserController {
    private final AdminUserService adminUserService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List users", description = "List users with filters")
    public Page<AdminUserDTO> listUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return adminUserService.getUsers(role, status, search, pageable);
    }

    @PutMapping("/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user status", description = "Suspend or activate a user")
    public AdminUserDTO updateStatus(
            @PathVariable String userId,
            @RequestBody AdminUserStatusRequest request,
            Authentication authentication
    ) {
        return adminUserService.updateStatus(authentication.getName(), userId, request.getStatus(), request.getReason());
    }

    @GetMapping("/appeals")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List appeals", description = "List account appeals")
    public Page<AccountAppealDTO> listAppeals(
            @RequestParam(required = false) AppealStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return adminUserService.getAppeals(status, pageable);
    }

    @PutMapping("/appeals/{appealId}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Resolve appeal", description = "Resolve account appeal")
    public AccountAppealDTO resolveAppeal(
            @PathVariable String appealId,
            @RequestBody AppealResolveRequest request,
            Authentication authentication
    ) {
        return adminUserService.resolveAppeal(authentication.getName(), appealId, request.getStatus(), request.getResolution());
    }
}
