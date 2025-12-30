package com.creatorx.api.controller;

import com.creatorx.service.admin.AdminFinanceService;
import com.creatorx.service.dto.FinanceSummaryDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/admin/finance")
@RequiredArgsConstructor
@Tag(name = "Admin Finance", description = "Financial reconciliation endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminFinanceController {
    private final AdminFinanceService adminFinanceService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Finance summary", description = "Get financial reconciliation summary")
    public FinanceSummaryDTO getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        return adminFinanceService.getSummary(from, to);
    }
}
