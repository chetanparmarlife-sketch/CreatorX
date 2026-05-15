package com.creatorx.api.controller;

import com.creatorx.api.dto.BulkStatusRequest;
import com.creatorx.api.dto.CampaignCreateRequest;
import com.creatorx.api.dto.CampaignUpdateRequest;
import com.creatorx.api.dto.InviteCreatorRequest;
import com.creatorx.api.dto.ReviewRequest;
import com.creatorx.api.dto.UpdateStatusRequest;
import com.creatorx.common.enums.CampaignPlatform;
import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.common.enums.SubmissionStatus;
import com.creatorx.common.permissions.AdminPermissions;
import com.creatorx.service.admin.AdminCampaignManagementService;
import com.creatorx.service.admin.AdminPermissionService;
import com.creatorx.service.dto.ApplicationDTO;
import com.creatorx.service.dto.CampaignDTO;
import com.creatorx.service.dto.CampaignDeliverableDTO;
import com.creatorx.service.dto.CampaignTemplateDTO;
import com.creatorx.service.dto.DeliverableDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/campaign-management")
@RequiredArgsConstructor
@Tag(name = "Admin Campaign Management", description = "Admin endpoints to manage campaigns on behalf of brands")
@SecurityRequirement(name = "bearerAuth")
public class AdminCampaignManagementController {
    private final AdminCampaignManagementService adminCampaignManagementService;
    private final AdminPermissionService adminPermissionService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List campaigns", description = "List campaigns with admin filters and optional brand scope")
    public Page<CampaignDTO> listCampaigns(
            @RequestParam(required = false) String brandId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) CampaignPlatform platform,
            @RequestParam(required = false) BigDecimal budgetMin,
            @RequestParam(required = false) BigDecimal budgetMax,
            @RequestParam(required = false) CampaignStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "created_at") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDirection,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        Pageable pageable = PageRequest.of(page, size, buildSort(sortBy, sortDirection));
        return adminCampaignManagementService.listCampaigns(
                brandId,
                status,
                category,
                platform,
                budgetMin,
                budgetMax,
                search,
                pageable);
    }

    @GetMapping("/{campaignId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get campaign", description = "Get campaign details for admin management")
    public CampaignDTO getCampaign(
            @PathVariable String campaignId,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        return adminCampaignManagementService.getCampaign(campaignId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create campaign", description = "Create a campaign on behalf of a brand")
    public CampaignDTO createCampaign(
            @RequestParam String brandId,
            @Valid @RequestBody CampaignCreateRequest request,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        CampaignDTO dto = mapCreateRequestToDTO(request);
        return adminCampaignManagementService.createCampaign(authentication.getName(), brandId, dto);
    }

    @PutMapping("/{campaignId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update campaign", description = "Update a campaign on behalf of the brand")
    public CampaignDTO updateCampaign(
            @PathVariable String campaignId,
            @Valid @RequestBody CampaignUpdateRequest request,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        CampaignDTO dto = mapUpdateRequestToDTO(request);
        return adminCampaignManagementService.updateCampaign(authentication.getName(), campaignId, dto);
    }

    @DeleteMapping("/{campaignId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete campaign", description = "Delete a campaign on behalf of the brand")
    public void deleteCampaign(
            @PathVariable String campaignId,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        adminCampaignManagementService.deleteCampaign(authentication.getName(), campaignId);
    }

    @PostMapping("/{campaignId}/invite")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Invite creator", description = "Invite a creator to a campaign as the brand")
    public ApplicationDTO inviteCreator(
            @PathVariable String campaignId,
            @Valid @RequestBody InviteCreatorRequest request,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        return adminCampaignManagementService.inviteCreator(
                authentication.getName(),
                campaignId,
                request.getCreatorId(),
                request.getMessage());
    }

    @GetMapping("/{campaignId}/applications")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List applications", description = "List applications for a campaign as admin")
    public Page<ApplicationDTO> listApplications(
            @PathVariable String campaignId,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "applied_at") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDirection,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), buildApplicationSort(sortBy, sortDirection));
        return adminCampaignManagementService.getApplications(campaignId, pageable);
    }

    @GetMapping("/applications")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List applications", description = "List applications across campaigns for admin")
    public Page<ApplicationDTO> listAllApplications(
            @RequestParam(required = false) String brandId,
            @RequestParam(required = false) String campaignId,
            @RequestParam(required = false) com.creatorx.common.enums.ApplicationStatus status,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "appliedAt"));
        return adminCampaignManagementService.listApplications(brandId, campaignId, status, pageable);
    }

    @PostMapping("/applications/{applicationId}/shortlist")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Shortlist application", description = "Shortlist an application on behalf of the brand")
    public ApplicationDTO shortlistApplication(
            @PathVariable String applicationId,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        return adminCampaignManagementService.shortlistApplication(authentication.getName(), applicationId);
    }

    @PostMapping("/applications/{applicationId}/select")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Select application", description = "Select an application on behalf of the brand")
    public ApplicationDTO selectApplication(
            @PathVariable String applicationId,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        return adminCampaignManagementService.selectApplication(authentication.getName(), applicationId);
    }

    @PostMapping("/applications/{applicationId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject application", description = "Reject an application with a reason")
    public ApplicationDTO rejectApplication(
            @PathVariable String applicationId,
            @RequestParam(required = false) String reason,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        String rejectionReason = reason;
        if (rejectionReason == null && body != null && body.containsKey("reason")) {
            rejectionReason = body.get("reason");
        }
        return adminCampaignManagementService.rejectApplication(
                authentication.getName(),
                applicationId,
                rejectionReason != null ? rejectionReason : "Not selected");
    }

    @PutMapping("/applications/{applicationId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update application status", description = "Update application status on behalf of the brand")
    public ApplicationDTO updateApplicationStatus(
            @PathVariable String applicationId,
            @Valid @RequestBody UpdateStatusRequest request,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        return adminCampaignManagementService.updateApplicationStatus(
                authentication.getName(),
                applicationId,
                request.getStatus(),
                request.getReason());
    }

    @PostMapping("/applications/bulk-status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk update application status", description = "Bulk update application status on behalf of the brand")
    public void bulkUpdateApplications(
            @Valid @RequestBody BulkStatusRequest request,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        adminCampaignManagementService.bulkUpdateApplications(
                authentication.getName(),
                request.getApplicationIds(),
                request.getStatus(),
                request.getReason());
    }

    @GetMapping("/{campaignId}/deliverables")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List deliverables", description = "List deliverables for a campaign as admin")
    public List<DeliverableDTO> listDeliverables(
            @PathVariable String campaignId,
            @RequestParam(required = false) SubmissionStatus status,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        return adminCampaignManagementService.getDeliverablesByCampaign(campaignId, status).getContent();
    }

    @GetMapping("/deliverables")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List deliverables", description = "List deliverables across campaigns for admin")
    public Page<DeliverableDTO> listAllDeliverables(
            @RequestParam(required = false) String brandId,
            @RequestParam(required = false) String campaignId,
            @RequestParam(required = false) SubmissionStatus status,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "submittedAt"));
        return adminCampaignManagementService.listDeliverables(brandId, campaignId, status, pageable);
    }

    @PostMapping("/deliverables/{submissionId}/review")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Review deliverable", description = "Review deliverable on behalf of the brand")
    public DeliverableDTO reviewDeliverable(
            @PathVariable String submissionId,
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        return adminCampaignManagementService.reviewDeliverable(
                authentication.getName(),
                submissionId,
                request.getStatus(),
                request.getFeedback());
    }

    @GetMapping("/templates")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List templates", description = "List campaign templates for a brand")
    public List<CampaignTemplateDTO> listTemplates(
            @RequestParam String brandId,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        return adminCampaignManagementService.listTemplates(brandId);
    }

    @GetMapping("/templates/{templateId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get template", description = "Get campaign template details")
    public CampaignTemplateDTO getTemplate(
            @PathVariable String templateId,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        return adminCampaignManagementService.getTemplate(templateId);
    }

    @PostMapping("/templates")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create template", description = "Create a campaign template for a brand")
    public CampaignTemplateDTO createTemplate(
            @RequestParam String brandId,
            @Valid @RequestBody CampaignTemplateDTO request,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        return adminCampaignManagementService.createTemplate(authentication.getName(), brandId, request);
    }

    @PostMapping("/templates/from-campaign/{campaignId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create template from campaign", description = "Create a template from a campaign")
    public CampaignTemplateDTO createTemplateFromCampaign(
            @PathVariable String campaignId,
            @RequestParam String brandId,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        return adminCampaignManagementService.createTemplateFromCampaign(authentication.getName(), brandId, campaignId);
    }

    @PutMapping("/templates/{templateId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update template", description = "Update a campaign template")
    public CampaignTemplateDTO updateTemplate(
            @PathVariable String templateId,
            @Valid @RequestBody CampaignTemplateDTO request,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        return adminCampaignManagementService.updateTemplate(authentication.getName(), templateId, request);
    }

    @DeleteMapping("/templates/{templateId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete template", description = "Delete a campaign template")
    public void deleteTemplate(
            @PathVariable String templateId,
            Authentication authentication) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_CAMPAIGN_MANAGE);
        adminCampaignManagementService.deleteTemplate(authentication.getName(), templateId);
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

    private Sort buildApplicationSort(String sortBy, String sortDirection) {
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
}
