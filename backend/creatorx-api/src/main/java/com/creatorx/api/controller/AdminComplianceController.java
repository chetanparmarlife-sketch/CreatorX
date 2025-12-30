package com.creatorx.api.controller;

import com.creatorx.api.dto.GDPRRequestUpdateRequest;
import com.creatorx.common.enums.GDPRRequestStatus;
import com.creatorx.common.enums.GDPRRequestType;
import com.creatorx.service.admin.ComplianceService;
import com.creatorx.service.dto.GDPRRequestDTO;
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
@RequestMapping("/api/v1/admin/compliance")
@RequiredArgsConstructor
@Tag(name = "Admin Compliance", description = "Compliance admin endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminComplianceController {
    private final ComplianceService complianceService;

    @GetMapping("/gdpr")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List GDPR requests (admin)")
    public Page<GDPRRequestDTO> listRequests(
            @RequestParam(required = false) GDPRRequestStatus status,
            @RequestParam(required = false) GDPRRequestType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return complianceService.getRequests(status, type, pageable);
    }

    @PutMapping("/gdpr/{requestId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update GDPR request")
    public GDPRRequestDTO updateRequest(
            @PathVariable String requestId,
            @RequestBody GDPRRequestUpdateRequest request,
            Authentication authentication
    ) {
        return complianceService.updateRequest(authentication.getName(), requestId, request.getStatus(), request.getExportUrl());
    }
}
