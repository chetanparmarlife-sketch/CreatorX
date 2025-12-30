package com.creatorx.api.controller;

import com.creatorx.common.enums.AdminActionType;
import com.creatorx.service.admin.AdminAuditService;
import com.creatorx.service.dto.AdminActionDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/admin/audit")
@RequiredArgsConstructor
@Tag(name = "Admin Audit", description = "Audit log access for admins")
@SecurityRequirement(name = "bearerAuth")
public class AdminAuditController {
    private final AdminAuditService adminAuditService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List audit logs", description = "List admin audit log entries with filters")
    public Page<AdminActionDTO> listAuditLogs(
            @RequestParam(required = false) String adminId,
            @RequestParam(required = false) AdminActionType actionType,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String entityId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return adminAuditService.getActions(adminId, actionType, entityType, entityId, from, to, pageable);
    }
}
