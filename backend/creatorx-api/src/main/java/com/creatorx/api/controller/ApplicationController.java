package com.creatorx.api.controller;

import com.creatorx.api.dto.ApplicationRequest;
import com.creatorx.api.dto.PageResponse;
import com.creatorx.common.enums.UserRole;
import com.creatorx.repository.entity.User;
import com.creatorx.service.ApplicationService;
import com.creatorx.service.dto.ApplicationDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/applications")
@Tag(name = "Applications", description = "Campaign application management. Creators can apply and withdraw. Brands can manage application status.")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ApplicationController {
    
    private final ApplicationService applicationService;
    
    /**
     * Submit application to campaign (Creator only)
     */
    @PostMapping
    @PreAuthorize("hasRole('CREATOR')")
    @Operation(summary = "Submit application", description = "Submit application to a campaign (Creator only)")
    public ResponseEntity<ApplicationDTO> submitApplication(@Valid @RequestBody ApplicationRequest request) {
        User currentUser = getCurrentUser();
        ApplicationDTO application = applicationService.submitApplication(
                currentUser.getId(),
                request.getCampaignId(),
                request.getPitchText(),
                request.getAvailability()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(application);
    }
    
    /**
     * Get applications for current user
     * - Creators see their own applications
     * - Brands see applications to their campaigns
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get applications", description = "Get paginated list of applications. Creators see their own, Brands see applications to their campaigns.")
    public ResponseEntity<PageResponse<ApplicationDTO>> getApplications(
            @RequestParam(required = false) String campaignId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "applied_at") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDirection
    ) {
        User currentUser = getCurrentUser();
        
        // Validate page size (max 100)
        int validatedSize = Math.min(size, 100);
        Sort sort = buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(page, validatedSize, sort);
        
        Page<ApplicationDTO> applications;
        
        if (currentUser.getRole() == UserRole.CREATOR) {
            // Creator sees their own applications
            if (status != null) {
                try {
                    com.creatorx.common.enums.ApplicationStatus statusEnum = 
                        com.creatorx.common.enums.ApplicationStatus.valueOf(status.toUpperCase());
                    applications = applicationService.getApplicationsByStatus(currentUser.getId(), statusEnum, pageable);
                } catch (IllegalArgumentException e) {
                    applications = applicationService.getApplications(currentUser.getId(), pageable);
                }
            } else {
                applications = applicationService.getApplications(currentUser.getId(), pageable);
            }
        } else if (currentUser.getRole() == UserRole.BRAND) {
            // Brand sees applications to their campaigns
            if (campaignId != null) {
                applications = applicationService.getApplicationsByCampaign(campaignId, currentUser.getId(), pageable);
            } else {
                applications = applicationService.getApplicationsForBrand(currentUser.getId(), pageable);
            }
        } else {
            // Admin or other roles - return empty or all applications
            applications = applicationService.getApplications(currentUser.getId(), pageable);
        }
        
        return ResponseEntity.ok(PageResponse.from(applications));
    }
    
    /**
     * Get application by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get application by ID", description = "Get detailed application information")
    public ResponseEntity<ApplicationDTO> getApplicationById(@PathVariable String id) {
        User currentUser = getCurrentUser();
        ApplicationDTO application = applicationService.getApplicationById(id, currentUser);
        return ResponseEntity.ok(application);
    }
    
    /**
     * Withdraw application (Creator only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CREATOR')")
    @Operation(summary = "Withdraw application", description = "Withdraw application (Creator only, only from APPLIED status)")
    public ResponseEntity<Void> withdrawApplication(@PathVariable String id) {
        User currentUser = getCurrentUser();
        applicationService.withdrawApplication(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Shortlist application (Brand only, Phase 2)
     */
    @PostMapping("/{id}/shortlist")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Shortlist application", description = "Shortlist an application (Brand only, Phase 2)")
    public ResponseEntity<Void> shortlistApplication(@PathVariable String id) {
        User currentUser = getCurrentUser();
        applicationService.shortlistApplication(currentUser.getId(), id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Select application (Brand only, Phase 2)
     */
    @PostMapping("/{id}/select")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Select application", description = "Select an application and create conversation (Brand only, Phase 2)")
    public ResponseEntity<Void> selectApplication(@PathVariable String id) {
        User currentUser = getCurrentUser();
        applicationService.selectApplication(currentUser.getId(), id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Reject application (Brand only, Phase 2)
     * Accepts reason in JSON body or query param for backward compatibility
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Reject application", description = "Reject an application with reason (Brand only, Phase 2)")
    public ResponseEntity<Void> rejectApplication(
            @PathVariable String id,
            @RequestParam(required = false) String reason,
            @RequestBody(required = false) java.util.Map<String, String> body
    ) {
        User currentUser = getCurrentUser();
        String rejectionReason = reason;
        if (rejectionReason == null && body != null && body.containsKey("reason")) {
            rejectionReason = body.get("reason");
        }
        applicationService.rejectApplication(currentUser.getId(), id, rejectionReason != null ? rejectionReason : "Not selected");
        return ResponseEntity.ok().build();
    }
    
    /**
     * Update application status (Brand only)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Update application status", description = "Update application status (SHORTLISTED, SELECTED, REJECTED) (Brand only)")
    public ResponseEntity<Void> updateApplicationStatus(
            @PathVariable String id,
            @Valid @RequestBody com.creatorx.api.dto.UpdateStatusRequest request
    ) {
        User currentUser = getCurrentUser();
        applicationService.updateApplicationStatus(
                currentUser.getId(), 
                id, 
                request.getStatus(), 
                request.getReason()
        );
        return ResponseEntity.ok().build();
    }

    /**
     * Bulk update application status (Brand only)
     */
    @PostMapping("/bulk-status")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Bulk update application status", description = "Update status for multiple applications")
    public ResponseEntity<Void> bulkUpdateStatus(
            @Valid @RequestBody com.creatorx.api.dto.BulkStatusRequest request
    ) {
        User currentUser = getCurrentUser();
        applicationService.updateApplicationsStatusBulk(
                currentUser.getId(),
                request.getApplicationIds(),
                request.getStatus(),
                request.getReason()
        );
        return ResponseEntity.ok().build();
    }
    
    // Helper methods
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication required");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        log.warn("Authentication principal is not a User instance: {}", principal != null ? principal.getClass() : "null");
        throw new org.springframework.security.access.AccessDeniedException("Invalid authentication principal");
    }
    
    private Sort buildSort(String sortBy, String sortDirection) {
        if (sortBy == null || sortBy.isEmpty()) {
            return Sort.by(Sort.Direction.DESC, "appliedAt");
        }
        
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection) 
                ? Sort.Direction.ASC 
                : Sort.Direction.DESC;
        
        return switch (sortBy.toLowerCase()) {
            case "applied_at", "applied" -> Sort.by(direction, "appliedAt");
            case "updated_at", "updated" -> Sort.by(direction, "updatedAt");
            case "status" -> Sort.by(direction, "status");
            default -> Sort.by(Sort.Direction.DESC, "appliedAt");
        };
    }
}
