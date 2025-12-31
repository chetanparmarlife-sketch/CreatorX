package com.creatorx.api.controller;

import com.creatorx.api.dto.DisputeCreateRequest;
import com.creatorx.api.dto.DisputeAssignRequest;
import com.creatorx.api.dto.DisputeEvidenceRequest;
import com.creatorx.api.dto.DisputeNoteRequest;
import com.creatorx.api.dto.DisputeResolveRequest;
import com.creatorx.common.enums.DisputeStatus;
import com.creatorx.common.enums.DisputeType;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.permissions.AdminPermissions;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.User;
import com.creatorx.service.DisputeService;
import com.creatorx.service.admin.AdminPermissionService;
import com.creatorx.service.dto.DisputeDTO;
import com.creatorx.service.dto.DisputeEvidenceDTO;
import com.creatorx.service.dto.DisputeNoteDTO;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/disputes")
@RequiredArgsConstructor
@Tag(name = "Disputes", description = "Dispute management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class DisputeController {
    private final DisputeService disputeService;
    private final UserRepository userRepository;
    private final AdminPermissionService adminPermissionService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create dispute", description = "Create a dispute between brand and creator")
    public DisputeDTO createDispute(
            @RequestBody DisputeCreateRequest request,
            Authentication authentication
    ) {
        User currentUser = userRepository.findById(authentication.getName())
                .orElseThrow(() -> new BusinessException("User not found"));

        String creatorId = request.getCreatorId();
        String brandId = request.getBrandId();

        if (currentUser.getRole() == UserRole.CREATOR) {
            creatorId = currentUser.getId();
            if (brandId == null) {
                throw new BusinessException("Brand ID is required");
            }
        } else if (currentUser.getRole() == UserRole.BRAND) {
            brandId = currentUser.getId();
            if (creatorId == null) {
                throw new BusinessException("Creator ID is required");
            }
        }

        return disputeService.createDispute(
                creatorId,
                brandId,
                request.getCampaignId(),
                request.getType(),
                request.getDescription()
        );
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List disputes", description = "List disputes for the current user")
    public Page<DisputeDTO> listDisputes(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return disputeService.getDisputesForUser(authentication.getName(), pageable);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List disputes (admin)", description = "List disputes with filters (Admin only)")
    public Page<DisputeDTO> listDisputesForAdmin(
            @RequestParam(required = false) DisputeStatus status,
            @RequestParam(required = false) DisputeType type,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_DISPUTE_MANAGE);
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "createdAt"));
        return disputeService.getDisputesForAdmin(status, type, pageable);
    }

    @GetMapping("/admin/{disputeId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get dispute (admin)", description = "Get dispute details (Admin only)")
    public DisputeDTO getDisputeForAdmin(
            @PathVariable String disputeId,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_DISPUTE_MANAGE);
        return disputeService.getDisputeForAdmin(disputeId);
    }

    @PutMapping("/{disputeId}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Resolve dispute", description = "Resolve or close a dispute (Admin only)")
    public DisputeDTO resolveDispute(
            @PathVariable String disputeId,
            @RequestBody DisputeResolveRequest request,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_DISPUTE_MANAGE);
        return disputeService.resolveDispute(
                authentication.getName(),
                disputeId,
                request.getStatus(),
                request.getResolution(),
                request.getResolutionType(),
                request.getActionAmount()
        );
    }

    @PutMapping("/{disputeId}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign dispute", description = "Assign dispute to an admin (Admin only)")
    public DisputeDTO assignDispute(
            @PathVariable String disputeId,
            @RequestBody DisputeAssignRequest request,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_DISPUTE_MANAGE);
        return disputeService.assignDispute(
                authentication.getName(),
                disputeId,
                request.getAdminId(),
                request.getNextAction()
        );
    }

    @PostMapping("/{disputeId}/evidence")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Add evidence", description = "Add evidence to a dispute")
    public DisputeEvidenceDTO addEvidence(
            @PathVariable String disputeId,
            @RequestBody DisputeEvidenceRequest request,
            Authentication authentication
    ) {
        return disputeService.addEvidence(disputeId, authentication.getName(), request.getFileUrl(), request.getFileType(), request.getNotes());
    }

    @GetMapping("/{disputeId}/evidence")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List evidence", description = "List evidence for a dispute")
    public List<DisputeEvidenceDTO> listEvidence(@PathVariable String disputeId) {
        return disputeService.getEvidence(disputeId);
    }

    @GetMapping("/{disputeId}/evidence/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List evidence (admin)", description = "List evidence for a dispute (Admin only)")
    public List<DisputeEvidenceDTO> listEvidenceForAdmin(
            @PathVariable String disputeId,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_DISPUTE_MANAGE);
        return disputeService.getEvidence(disputeId);
    }

    @PostMapping("/{disputeId}/notes")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add internal note", description = "Add an internal admin note to a dispute")
    public DisputeNoteDTO addInternalNote(
            @PathVariable String disputeId,
            @RequestBody DisputeNoteRequest request,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_DISPUTE_MANAGE);
        return disputeService.addInternalNote(authentication.getName(), disputeId, request.getNote());
    }

    @GetMapping("/{disputeId}/notes")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List internal notes", description = "List internal admin notes for a dispute")
    public List<DisputeNoteDTO> listInternalNotes(
            @PathVariable String disputeId,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_DISPUTE_MANAGE);
        return disputeService.getInternalNotes(disputeId);
    }
}
