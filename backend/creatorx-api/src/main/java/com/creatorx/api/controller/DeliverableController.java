package com.creatorx.api.controller;

import com.creatorx.api.dto.DeliverableSubmitRequest;
import com.creatorx.api.dto.PageResponse;
import com.creatorx.api.dto.ReviewRequest;
import com.creatorx.common.enums.SubmissionStatus;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.User;
import com.creatorx.service.DeliverableService;
import com.creatorx.service.dto.DeliverableDTO;
import com.creatorx.service.dto.DeliverableHistoryDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/deliverables")
@RequiredArgsConstructor
public class DeliverableController {

    private final DeliverableService deliverableService;
    private final UserRepository userRepository;

    /**
     * Get deliverables with pagination
     * - Creators see their own deliverables
     * - Brands see deliverables for their campaigns
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PageResponse<DeliverableDTO>> getDeliverables(
            @RequestParam(required = false) String campaignId,
            @RequestParam(required = false) String applicationId,
            @RequestParam(required = false) SubmissionStatus status,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size,
            Authentication authentication) {
        String userId = authentication.getName();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));
        UserRole userRole = user.getRole();

        // Validate page size (max 100)
        int validatedSize = Math.min(size, 100);

        Page<DeliverableDTO> deliverables;

        if (userRole == com.creatorx.common.enums.UserRole.CREATOR) {
            // Creator sees their own deliverables
            deliverables = deliverableService.getDeliverables(userId, status, page, validatedSize);
        } else if (userRole == com.creatorx.common.enums.UserRole.BRAND) {
            // Brand sees deliverables for their campaigns
            if (campaignId != null) {
                deliverables = deliverableService.getDeliverablesByCampaign(campaignId, userId, status, page,
                        validatedSize);
            } else if (applicationId != null) {
                deliverables = deliverableService.getDeliverablesByApplication(applicationId, userId, status, page,
                        validatedSize);
            } else {
                deliverables = deliverableService.getDeliverablesForBrand(userId, status, page, validatedSize);
            }
        } else {
            throw new BusinessException("Unauthorized access");
        }

        return ResponseEntity.ok(PageResponse.from(deliverables));
    }

    /**
     * Submit deliverable (with file upload)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<DeliverableDTO> submitDeliverable(
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "applicationId", required = true) String applicationId,
            @RequestPart(value = "campaignDeliverableId", required = true) String campaignDeliverableId,
            @RequestPart(value = "description", required = false) String description,
            Authentication authentication) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("File is required");
        }

        String creatorId = authentication.getName();

        DeliverableDTO deliverable = deliverableService.submitDeliverable(
                creatorId,
                applicationId,
                campaignDeliverableId,
                file,
                description);

        return ResponseEntity.status(HttpStatus.CREATED).body(deliverable);
    }

    /**
     * Resubmit deliverable after revision request
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<DeliverableDTO> resubmitDeliverable(
            @PathVariable String id,
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "description", required = false) String description,
            Authentication authentication) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("File is required");
        }

        String creatorId = authentication.getName();

        DeliverableDTO deliverable = deliverableService.resubmitDeliverable(
                creatorId,
                id,
                file,
                description);

        return ResponseEntity.ok(deliverable);
    }

    /**
     * Get deliverable history (all versions)
     */
    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('CREATOR', 'BRAND')")
    public ResponseEntity<List<DeliverableHistoryDTO>> getDeliverableHistory(
            @PathVariable String id,
            Authentication authentication) {
        List<DeliverableHistoryDTO> history = deliverableService.getDeliverableHistory(id);
        return ResponseEntity.ok(history);
    }

    /**
     * Review deliverable (Brand only, Phase 2)
     */
    @PostMapping("/{id}/review")
    @PreAuthorize("hasRole('BRAND')")
    public ResponseEntity<Void> reviewDeliverable(
            @PathVariable String id,
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        String brandId = authentication.getName();

        deliverableService.reviewDeliverable(
                brandId,
                id,
                request.getStatus(),
                request.getFeedback());

        return ResponseEntity.noContent().build();
    }
}
