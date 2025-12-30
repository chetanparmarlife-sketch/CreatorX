package com.creatorx.api.controller;

import com.creatorx.api.dto.AppealRequest;
import com.creatorx.service.admin.AdminUserService;
import com.creatorx.service.dto.AccountAppealDTO;
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
@RequestMapping("/api/v1/appeals")
@RequiredArgsConstructor
@Tag(name = "Appeals", description = "Account appeal endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AppealController {
    private final AdminUserService adminUserService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Submit appeal", description = "Submit an account appeal")
    public AccountAppealDTO submitAppeal(
            @RequestBody AppealRequest request,
            Authentication authentication
    ) {
        return adminUserService.submitAppeal(authentication.getName(), request.getReason());
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List appeals", description = "List appeals for the current user")
    public Page<AccountAppealDTO> listAppeals(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return adminUserService.getAppealsForUser(authentication.getName(), pageable);
    }
}
