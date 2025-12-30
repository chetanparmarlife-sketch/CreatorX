package com.creatorx.api.controller;

import com.creatorx.service.admin.AdminSystemService;
import com.creatorx.service.dto.AdminSummaryDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/system")
@RequiredArgsConstructor
@Tag(name = "Admin System", description = "System health and metrics endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminSystemController {
    private final AdminSystemService adminSystemService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "System summary", description = "Get system health summary")
    public AdminSummaryDTO getSummary() {
        return adminSystemService.getSummary();
    }
}
