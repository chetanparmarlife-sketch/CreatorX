package com.creatorx.api.controller;

import com.creatorx.api.dto.CampaignCreateRequest;
import com.creatorx.common.dto.CampaignFilterRequest;
import com.creatorx.api.dto.CampaignUpdateRequest;
import com.creatorx.common.enums.CampaignPlatform;
import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.common.enums.SubmissionStatus;
import com.creatorx.common.enums.UserRole;
import com.creatorx.repository.entity.User;
import com.creatorx.service.ApplicationService;
import com.creatorx.service.CampaignService;
import com.creatorx.service.DeliverableService;
import com.creatorx.service.dto.CampaignDTO;
import com.creatorx.service.dto.CampaignDeliverableDTO;
import com.creatorx.service.dto.DeliverableDTO;
import com.creatorx.service.dto.ApplicationDTO;
import com.creatorx.api.dto.PageResponse;
import com.creatorx.service.mapper.CampaignMapper;
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

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/campaigns")
@Tag(name = "Campaigns", description = "Campaign discovery and management. Creators can browse and save campaigns. Brands can create and manage their campaigns.")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class CampaignController {

    private final CampaignService campaignService;
    private final CampaignMapper campaignMapper;
    private final ApplicationService applicationService;
    private final DeliverableService deliverableService;

    /**
     * Get campaigns with filters and pagination
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get campaigns", description = "Get paginated list of campaigns with filters")
    public ResponseEntity<PageResponse<CampaignDTO>> getCampaigns(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) CampaignPlatform platform,
            @RequestParam(required = false) BigDecimal budgetMin,
            @RequestParam(required = false) BigDecimal budgetMax,
            @RequestParam(required = false) CampaignStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "created_at") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDirection,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        User currentUser = getCurrentUser();

        Page<CampaignDTO> campaigns = campaignService.getCampaigns(
                category,
                platform,
                budgetMin,
                budgetMax,
                status,
                search,
                sortBy,
                sortDirection,
                page,
                size,
                currentUser);

        return ResponseEntity.ok(PageResponse.from(campaigns));
    }

    /**
     * Get campaign by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get campaign by ID", description = "Get detailed campaign information")
    public ResponseEntity<CampaignDTO> getCampaignById(@PathVariable String id) {
        User currentUser = getCurrentUser();
        CampaignDTO campaign = campaignService.getCampaignById(id, currentUser);
        return ResponseEntity.ok(campaign);
    }

    /**
     * Get deliverables for a campaign (Brand only, own campaigns)
     * Convenience alias for Brand Dashboard: GET /campaigns/{id}/deliverables
     */
    @GetMapping("/{id}/deliverables")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Get campaign deliverables", description = "Get list of deliverables submitted for a campaign (Brand only, own campaigns)")
    public ResponseEntity<List<DeliverableDTO>> getCampaignDeliverables(
            @PathVariable String id,
            @RequestParam(required = false) SubmissionStatus status,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "100") int size) {
        User currentUser = getCurrentUser();
        List<DeliverableDTO> deliverables = deliverableService
                .getDeliverablesByCampaign(id, currentUser.getId(), status, page, size).getContent();
        return ResponseEntity.ok(deliverables);
    }

    /**
     * Get applications for a campaign (Brand only, own campaigns)
     * Convenience alias for Brand Dashboard: GET /campaigns/{id}/applications
     */
    @GetMapping("/{id}/applications")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Get campaign applications", description = "Get list of applications for a campaign (Brand only, own campaigns)")
    public ResponseEntity<List<ApplicationDTO>> getCampaignApplications(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "100") int size) {
        User currentUser = getCurrentUser();

        // Validate page size (max 500 to avoid huge responses)
        int validatedSize = Math.min(size, 500);
        Pageable pageable = PageRequest.of(page, validatedSize, Sort.by(Sort.Direction.DESC, "appliedAt"));

        Page<ApplicationDTO> applicationsPage = applicationService.getApplicationsByCampaign(id, currentUser.getId(),
                pageable);
        return ResponseEntity.ok(applicationsPage.getContent());
    }

    /**
     * Create new campaign (Brand only)
     */
    @PostMapping
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Create campaign", description = "Create a new campaign (Brand only)")
    public ResponseEntity<CampaignDTO> createCampaign(@Valid @RequestBody CampaignCreateRequest request) {
        User currentUser = getCurrentUser();

        CampaignDTO campaignDTO = mapCreateRequestToDTO(request);
        CampaignDTO created = campaignService.createCampaign(campaignDTO, currentUser.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update campaign (Brand only, own campaigns)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Update campaign", description = "Update campaign details (Brand only, own campaigns)")
    public ResponseEntity<CampaignDTO> updateCampaign(
            @PathVariable String id,
            @Valid @RequestBody CampaignUpdateRequest request) {
        User currentUser = getCurrentUser();

        CampaignDTO campaignDTO = mapUpdateRequestToDTO(request);
        CampaignDTO updated = campaignService.updateCampaign(id, campaignDTO, currentUser.getId());

        return ResponseEntity.ok(updated);
    }

    /**
     * Delete campaign (Brand only, own campaigns)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Delete campaign", description = "Delete a campaign (Brand only, own campaigns)")
    public ResponseEntity<Void> deleteCampaign(@PathVariable String id) {
        User currentUser = getCurrentUser();
        campaignService.deleteCampaign(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Save campaign (Creator only)
     */
    @PostMapping("/{id}/save")
    @PreAuthorize("hasRole('CREATOR')")
    @Operation(summary = "Save campaign", description = "Save campaign to favorites (Creator only)")
    public ResponseEntity<Void> saveCampaign(@PathVariable String id) {
        User currentUser = getCurrentUser();
        campaignService.saveCampaign(currentUser.getId(), id);
        return ResponseEntity.ok().build();
    }

    /**
     * Unsave campaign (Creator only)
     */
    @DeleteMapping("/{id}/save")
    @PreAuthorize("hasRole('CREATOR')")
    @Operation(summary = "Unsave campaign", description = "Remove campaign from favorites (Creator only)")
    public ResponseEntity<Void> unsaveCampaign(@PathVariable String id) {
        User currentUser = getCurrentUser();
        campaignService.unsaveCampaign(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get saved campaigns (Creator only)
     */
    @GetMapping("/saved")
    @PreAuthorize("hasRole('CREATOR')")
    @Operation(summary = "Get saved campaigns", description = "Get list of saved campaigns (Creator only)")
    public ResponseEntity<List<CampaignDTO>> getSavedCampaigns() {
        User currentUser = getCurrentUser();
        List<CampaignDTO> savedCampaigns = campaignService.getSavedCampaigns(currentUser.getId());
        return ResponseEntity.ok(savedCampaigns);
    }

    /**
     * Search campaigns with full-text search
     */
    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Search campaigns", description = "Full-text search campaigns")
    public ResponseEntity<PageResponse<CampaignDTO>> searchCampaigns(
            @RequestParam @jakarta.validation.constraints.NotBlank(message = "Search query is required") @jakarta.validation.constraints.Size(max = 200, message = "Search query must not exceed 200 characters") String query,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "created_at") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDirection) {
        User currentUser = getCurrentUser();

        // Validate page size (max 100)
        int validatedSize = Math.min(size, 100);
        Sort sort = buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(page, validatedSize, sort);

        Page<CampaignDTO> campaigns = campaignService.searchCampaigns(query, pageable, currentUser);

        return ResponseEntity.ok(PageResponse.from(campaigns));
    }

    /**
     * Get active campaigns (Creator only)
     */
    @GetMapping("/active")
    @PreAuthorize("hasRole('CREATOR')")
    @Operation(summary = "Get active campaigns", description = "Get list of all active campaigns for creators (Creator only)")
    public ResponseEntity<List<CampaignDTO>> getActiveCampaigns() {
        User currentUser = getCurrentUser();
        List<CampaignDTO> activeCampaigns = campaignService.getActiveCampaigns(currentUser.getId());
        return ResponseEntity.ok(activeCampaigns);
    }

    /**
     * Invite creator to campaign (Brand only)
     */
    @PostMapping("/{id}/invite")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Invite creator to campaign", description = "Invite a creator to apply to a campaign (Brand only, own campaigns)")
    public ResponseEntity<ApplicationDTO> inviteCreator(
            @PathVariable String id,
            @Valid @RequestBody com.creatorx.api.dto.InviteCreatorRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication required");
        }
        ApplicationDTO application = applicationService.inviteCreator(currentUser.getId(), id, request.getCreatorId(),
                request.getMessage());
        return ResponseEntity.ok(application);
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
        log.warn("Authentication principal is not a User instance: {}",
                principal != null ? principal.getClass() : "null");
        throw new org.springframework.security.access.AccessDeniedException("Invalid authentication principal");
    }

    private CampaignDTO mapCreateRequestToDTO(CampaignCreateRequest request) {
        CampaignDTO dto = new CampaignDTO();
        dto.setTitle(request.getTitle());
        dto.setDescription(request.getDescription());
        dto.setBudget(request.getBudget());
        dto.setPlatform(request.getPlatform());
        dto.setCategory(request.getCategory());
        dto.setRequirements(request.getRequirements());
        dto.setDeliverableTypes(request.getDeliverableTypes());
        dto.setStartDate(request.getStartDate());
        dto.setEndDate(request.getEndDate());
        dto.setApplicationDeadline(request.getApplicationDeadline());
        dto.setMaxApplicants(request.getMaxApplicants());
        dto.setTags(request.getTags());

        if (request.getDeliverables() != null) {
            List<CampaignDeliverableDTO> deliverables = request.getDeliverables().stream()
                    .map(req -> {
                        CampaignDeliverableDTO delDTO = new CampaignDeliverableDTO();
                        delDTO.setTitle(req.getTitle());
                        delDTO.setDescription(req.getDescription());
                        delDTO.setType(CampaignDeliverableDTO.CampaignDeliverableType.valueOf(req.getType().name()));
                        delDTO.setDueDate(req.getDueDate());
                        delDTO.setIsMandatory(req.getIsMandatory());
                        delDTO.setOrderIndex(req.getOrderIndex());
                        return delDTO;
                    })
                    .toList();
            dto.setDeliverables(deliverables);
        }

        return dto;
    }

    private CampaignDTO mapUpdateRequestToDTO(CampaignUpdateRequest request) {
        CampaignDTO dto = new CampaignDTO();
        dto.setTitle(request.getTitle());
        dto.setDescription(request.getDescription());
        dto.setBudget(request.getBudget());
        dto.setCategory(request.getCategory());
        dto.setRequirements(request.getRequirements());
        dto.setDeliverableTypes(request.getDeliverableTypes());
        dto.setStartDate(request.getStartDate());
        dto.setEndDate(request.getEndDate());
        dto.setApplicationDeadline(request.getApplicationDeadline());
        dto.setMaxApplicants(request.getMaxApplicants());
        dto.setStatus(request.getStatus());
        dto.setTags(request.getTags());

        if (request.getDeliverables() != null) {
            List<CampaignDeliverableDTO> deliverables = request.getDeliverables().stream()
                    .map(req -> {
                        CampaignDeliverableDTO delDTO = new CampaignDeliverableDTO();
                        delDTO.setTitle(req.getTitle());
                        delDTO.setDescription(req.getDescription());
                        delDTO.setType(CampaignDeliverableDTO.CampaignDeliverableType.valueOf(req.getType().name()));
                        delDTO.setDueDate(req.getDueDate());
                        delDTO.setIsMandatory(req.getIsMandatory());
                        delDTO.setOrderIndex(req.getOrderIndex());
                        return delDTO;
                    })
                    .toList();
            dto.setDeliverables(deliverables);
        }

        return dto;
    }

    private Sort buildSort(String sortBy, String sortDirection) {
        if (sortBy == null || sortBy.isEmpty()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return switch (sortBy.toLowerCase()) {
            case "budget" -> Sort.by(direction, "budget");
            case "deadline" -> Sort.by(direction, "endDate");
            case "created_at", "created" -> Sort.by(direction, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }
}
