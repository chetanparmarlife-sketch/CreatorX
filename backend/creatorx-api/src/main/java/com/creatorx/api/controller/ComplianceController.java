package com.creatorx.api.controller;

import com.creatorx.api.dto.GDPRRequestCreateRequest;
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
@RequestMapping("/api/v1/compliance")
@RequiredArgsConstructor
@Tag(name = "Compliance", description = "Compliance endpoints for users")
@SecurityRequirement(name = "bearerAuth")
public class ComplianceController {
    private final ComplianceService complianceService;

    @PostMapping("/gdpr")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Submit GDPR request")
    public GDPRRequestDTO submitRequest(
            @RequestBody GDPRRequestCreateRequest request,
            Authentication authentication
    ) {
        return complianceService.submitRequest(authentication.getName(), request.getRequestType(), request.getDetails());
    }

    @GetMapping("/gdpr")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List GDPR requests")
    public Page<GDPRRequestDTO> listRequests(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return complianceService.getRequestsForUser(authentication.getName(), pageable);
    }
}
