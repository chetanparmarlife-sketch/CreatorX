package com.creatorx.service;

import com.creatorx.common.enums.ApplicationStatus;
import com.creatorx.common.enums.NotificationType;
import com.creatorx.common.enums.SubmissionStatus;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.common.exception.UnauthorizedException;
import com.creatorx.repository.ApplicationRepository;
import com.creatorx.repository.CampaignDeliverableRepository;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.DeliverableRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.Application;
import com.creatorx.repository.entity.CampaignDeliverable;
import com.creatorx.repository.entity.DeliverableReview;
import com.creatorx.repository.entity.DeliverableSubmission;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.DeliverableDTO;
import com.creatorx.service.dto.DeliverableHistoryDTO;
import com.creatorx.service.dto.FileUploadResponse;
import com.creatorx.service.mapper.DeliverableMapper;
import com.creatorx.service.storage.FileValidationService;
import com.creatorx.service.storage.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliverableService {
    
    private final DeliverableRepository deliverableRepository;
    private final ApplicationRepository applicationRepository;
    private final CampaignDeliverableRepository campaignDeliverableRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final DeliverableMapper deliverableMapper;
    private final SupabaseStorageService storageService;
    
    /**
     * Get deliverables for creator (filtered by status)
     */
    @Transactional(readOnly = true)
    public List<DeliverableDTO> getDeliverables(String creatorId, SubmissionStatus status) {
        List<DeliverableSubmission> submissions;
        
        if (status != null) {
            Page<DeliverableSubmission> page = deliverableRepository.findByCreatorIdAndStatus(
                    creatorId, status, Pageable.unpaged());
            submissions = page.getContent();
        } else {
            Page<DeliverableSubmission> page = deliverableRepository.findByCreatorId(
                    creatorId, Pageable.unpaged());
            submissions = page.getContent();
        }
        
        return submissions.stream()
                .map(submission -> {
                    DeliverableDTO dto = deliverableMapper.toDTO(submission);
                    enrichDeliverableDTO(dto, submission);
                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Get deliverables for brand (all campaigns owned by brand)
     */
    @Transactional(readOnly = true)
    public List<DeliverableDTO> getDeliverablesForBrand(String brandId, SubmissionStatus status) {
        List<DeliverableSubmission> submissions;
        
        if (status != null && status == SubmissionStatus.PENDING) {
            // Use optimized query for pending
            Page<DeliverableSubmission> page = deliverableRepository.findPendingDeliverablesForBrand(
                    brandId, Pageable.unpaged());
            submissions = page.getContent();
        } else {
            // Get all deliverables for brand
            Page<DeliverableSubmission> page = deliverableRepository.findDeliverablesForBrand(
                    brandId, Pageable.unpaged());
            submissions = page.getContent();
            
            // Filter by status if specified
            if (status != null) {
                submissions = submissions.stream()
                        .filter(ds -> ds.getStatus() == status)
                        .collect(Collectors.toList());
            }
        }
        
        return submissions.stream()
                .map(submission -> {
                    DeliverableDTO dto = deliverableMapper.toDTO(submission);
                    enrichDeliverableDTO(dto, submission);
                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Get deliverables for a specific campaign (brand only)
     */
    @Transactional(readOnly = true)
    public List<DeliverableDTO> getDeliverablesByCampaign(String campaignId, String brandId, SubmissionStatus status) {
        // Verify brand owns the campaign
        com.creatorx.repository.entity.Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", campaignId));
        
        if (!campaign.getBrand().getId().equals(brandId)) {
            throw new UnauthorizedException("You can only view deliverables for your own campaigns");
        }
        
        // Get all applications for this campaign
        List<String> applicationIds = applicationRepository.findByCampaignId(campaignId).stream()
                .map(app -> app.getId())
                .collect(Collectors.toList());
        
        // Get deliverables for these applications
        List<DeliverableSubmission> submissions = new java.util.ArrayList<>();
        for (String applicationId : applicationIds) {
            List<DeliverableSubmission> appDeliverables = deliverableRepository.findByApplicationId(applicationId);
            if (status != null) {
                appDeliverables = appDeliverables.stream()
                        .filter(ds -> ds.getStatus() == status)
                        .collect(Collectors.toList());
            }
            submissions.addAll(appDeliverables);
        }
        
        return submissions.stream()
                .map(submission -> {
                    DeliverableDTO dto = deliverableMapper.toDTO(submission);
                    enrichDeliverableDTO(dto, submission);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get deliverables for admin (optionally filtered by brand or campaign).
     */
    @Transactional(readOnly = true)
    public Page<DeliverableDTO> getDeliverablesForAdmin(String brandId, String campaignId, SubmissionStatus status, Pageable pageable) {
        Page<DeliverableSubmission> submissions = deliverableRepository.findAdminDeliverables(
                brandId,
                campaignId,
                status,
                pageable
        );

        return submissions.map(submission -> {
            DeliverableDTO dto = deliverableMapper.toDTO(submission);
            enrichDeliverableDTO(dto, submission);
            return dto;
        });
    }
    
    /**
     * Get deliverables for a specific application (brand only)
     */
    @Transactional(readOnly = true)
    public List<DeliverableDTO> getDeliverablesByApplication(String applicationId, String brandId, SubmissionStatus status) {
        // Verify brand owns the campaign
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", applicationId));
        
        if (!application.getCampaign().getBrand().getId().equals(brandId)) {
            throw new UnauthorizedException("You can only view deliverables for your own campaigns");
        }
        
        List<DeliverableSubmission> submissions = deliverableRepository.findByApplicationId(applicationId);
        
        if (status != null) {
            submissions = submissions.stream()
                    .filter(ds -> ds.getStatus() == status)
                    .collect(Collectors.toList());
        }
        
        return submissions.stream()
                .map(submission -> {
                    DeliverableDTO dto = deliverableMapper.toDTO(submission);
                    enrichDeliverableDTO(dto, submission);
                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Submit deliverable (with file upload)
     */
    @Transactional
    public DeliverableDTO submitDeliverable(
            String creatorId,
            String applicationId,
            String campaignDeliverableId,
            MultipartFile file,
            String description
    ) {
        // Load and validate application
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", applicationId));
        
        // Verify creator owns the application
        if (!application.getCreator().getId().equals(creatorId)) {
            throw new UnauthorizedException("You can only submit deliverables for your own applications");
        }
        
        // Verify application is SELECTED
        if (application.getStatus() != ApplicationStatus.SELECTED) {
            throw new BusinessException("Can only submit deliverables for SELECTED applications");
        }
        
        // Load campaign deliverable
        CampaignDeliverable campaignDeliverable = campaignDeliverableRepository.findById(campaignDeliverableId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign deliverable", campaignDeliverableId));
        
        // Verify campaign deliverable belongs to application's campaign
        if (!campaignDeliverable.getCampaign().getId().equals(application.getCampaign().getId())) {
            throw new BusinessException("Campaign deliverable does not belong to the application's campaign");
        }
        
        // Validate description
        if (description != null && (description.length() < 20 || description.length() > 500)) {
            throw new BusinessException("Description must be between 20 and 500 characters");
        }
        
        // Check if submission already exists
        Page<DeliverableSubmission> existingSubmissions = deliverableRepository
                .findLatestByApplicationIdAndCampaignDeliverableId(
                        applicationId, 
                        campaignDeliverableId,
                        Pageable.ofSize(1)
                );
        DeliverableSubmission existingSubmission = existingSubmissions.getContent().isEmpty() 
                ? null 
                : existingSubmissions.getContent().get(0);
        
        // Upload file
        String folder = String.format("deliverables/%s/%s", applicationId, campaignDeliverableId);
        FileUploadResponse uploadResponse = storageService.uploadFile(
                file,
                "deliverables",
                folder,
                FileValidationService.FileCategory.DELIVERABLE
        );
        
        DeliverableSubmission submission;
        int versionNumber;
        
        if (existingSubmission != null) {
            // Update existing submission (resubmission)
            if (existingSubmission.getStatus() != SubmissionStatus.REVISION_REQUESTED) {
                throw new BusinessException("Can only resubmit deliverables with REVISION_REQUESTED status");
            }
            
            // Delete old file if it exists
            if (existingSubmission.getFileUrl() != null) {
                try {
                    storageService.deleteFile(existingSubmission.getFileUrl());
                } catch (Exception e) {
                    log.warn("Failed to delete old file: {}", existingSubmission.getFileUrl(), e);
                }
            }
            
            // Update submission
            existingSubmission.setFileUrl(uploadResponse.getFileUrl());
            existingSubmission.setDescription(description);
            existingSubmission.setStatus(SubmissionStatus.PENDING);
            existingSubmission.setSubmittedAt(LocalDateTime.now());
            
            // Get version number
            versionNumber = (int) deliverableRepository.countByApplicationIdAndCampaignDeliverableId(
                    applicationId, campaignDeliverableId);
            
            submission = deliverableRepository.save(existingSubmission);
        } else {
            // Create new submission
            versionNumber = 1;
            
            submission = DeliverableSubmission.builder()
                    .application(application)
                    .campaignDeliverable(campaignDeliverable)
                    .fileUrl(uploadResponse.getFileUrl())
                    .description(description)
                    .status(SubmissionStatus.PENDING)
                    .submittedAt(LocalDateTime.now())
                    .build();
            
            submission = deliverableRepository.save(submission);
        }
        
        log.info("Deliverable submitted: {} by creator: {} for application: {}", 
                submission.getId(), creatorId, applicationId);
        
        // Send notification to brand
        sendNotification(
                application.getCampaign().getBrand().getId(),
                NotificationType.CAMPAIGN,
                "New Deliverable Submitted",
                String.format("Creator %s has submitted a deliverable for campaign: %s",
                        getCreatorName(application.getCreator()), application.getCampaign().getTitle()),
                Map.of("deliverableId", submission.getId(), "applicationId", applicationId, 
                       "campaignId", application.getCampaign().getId())
        );
        
        DeliverableDTO dto = deliverableMapper.toDTO(submission);
        enrichDeliverableDTO(dto, submission);
        dto.setVersionNumber(versionNumber);
        dto.setIsLatest(true);
        dto.setFileName(file.getOriginalFilename());
        dto.setFileType(file.getContentType());
        dto.setFileSize(file.getSize());
        
        return dto;
    }
    
    /**
     * Resubmit deliverable after revision request
     */
    @Transactional
    public DeliverableDTO resubmitDeliverable(
            String creatorId,
            String submissionId,
            MultipartFile file,
            String description
    ) {
        DeliverableSubmission submission = deliverableRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Deliverable submission", submissionId));
        
        // Verify creator owns the submission
        if (!submission.getApplication().getCreator().getId().equals(creatorId)) {
            throw new UnauthorizedException("You can only resubmit your own deliverables");
        }
        
        // Verify status allows resubmission
        if (submission.getStatus() != SubmissionStatus.REVISION_REQUESTED) {
            throw new BusinessException("Can only resubmit deliverables with REVISION_REQUESTED status");
        }
        
        // Validate description
        if (description != null && (description.length() < 20 || description.length() > 500)) {
            throw new BusinessException("Description must be between 20 and 500 characters");
        }
        
        // Delete old file
        if (submission.getFileUrl() != null) {
            try {
                storageService.deleteFile(submission.getFileUrl());
            } catch (Exception e) {
                log.warn("Failed to delete old file: {}", submission.getFileUrl(), e);
            }
        }
        
        // Upload new file
        String folder = String.format("deliverables/%s/%s", 
                submission.getApplication().getId(), 
                submission.getCampaignDeliverable().getId());
        FileUploadResponse uploadResponse = storageService.uploadFile(
                file,
                "deliverables",
                folder,
                FileValidationService.FileCategory.DELIVERABLE
        );
        
        // Update submission
        submission.setFileUrl(uploadResponse.getFileUrl());
        submission.setDescription(description);
        submission.setStatus(SubmissionStatus.PENDING);
        submission.setSubmittedAt(LocalDateTime.now());
        
        // Clear review (new submission)
        if (submission.getReview() != null) {
            submission.getReview().setFeedback(null);
            submission.getReview().setRevisionNotes(null);
        }
        
        submission = deliverableRepository.save(submission);
        
        log.info("Deliverable resubmitted: {} by creator: {}", submissionId, creatorId);
        
        // Send notification to brand
        sendNotification(
                submission.getApplication().getCampaign().getBrand().getId(),
                NotificationType.CAMPAIGN,
                "Deliverable Resubmitted",
                String.format("Creator %s has resubmitted a deliverable for campaign: %s",
                        getCreatorName(submission.getApplication().getCreator()), 
                        submission.getApplication().getCampaign().getTitle()),
                Map.of("deliverableId", submission.getId(), "applicationId", submission.getApplication().getId())
        );
        
        DeliverableDTO dto = deliverableMapper.toDTO(submission);
        enrichDeliverableDTO(dto, submission);
        dto.setFileName(file.getOriginalFilename());
        dto.setFileType(file.getContentType());
        dto.setFileSize(file.getSize());
        
        return dto;
    }
    
    /**
     * Get deliverable history (all versions)
     */
    @Transactional(readOnly = true)
    public List<DeliverableHistoryDTO> getDeliverableHistory(String submissionId) {
        DeliverableSubmission currentSubmission = deliverableRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Deliverable submission", submissionId));
        
        // Get all submissions for this application + campaign deliverable
        List<DeliverableSubmission> allSubmissions = deliverableRepository
                .findByApplicationIdAndCampaignDeliverableId(
                        currentSubmission.getApplication().getId(),
                        currentSubmission.getCampaignDeliverable().getId()
                );
        
        // Since we update existing submissions, we'll create history from the current submission
        // and its review history. For now, return the current submission as history.
        // In a full implementation, you might want a separate history table.
        
        return allSubmissions.stream()
                .map(sub -> {
                    int version = (int) (allSubmissions.indexOf(sub) + 1);
                    return DeliverableHistoryDTO.builder()
                            .submissionId(sub.getId())
                            .fileUrl(sub.getFileUrl())
                            .description(sub.getDescription())
                            .status(sub.getStatus())
                            .feedback(sub.getReview() != null ? sub.getReview().getFeedback() : null)
                            .submittedAt(sub.getSubmittedAt())
                            .reviewedAt(sub.getReview() != null ? sub.getReview().getReviewedAt() : null)
                            .versionNumber(version)
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Review deliverable (Brand only, Phase 2)
     */
    @Transactional
    public void reviewDeliverable(String brandId, String submissionId, SubmissionStatus status, String feedback) {
        DeliverableSubmission submission = deliverableRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Deliverable submission", submissionId));
        
        // Verify brand owns the campaign
        if (!submission.getApplication().getCampaign().getBrand().getId().equals(brandId)) {
            throw new UnauthorizedException("You can only review deliverables for your own campaigns");
        }
        
        // Verify status is valid for review
        if (status != SubmissionStatus.APPROVED && 
            status != SubmissionStatus.REVISION_REQUESTED && 
            status != SubmissionStatus.REJECTED) {
            throw new BusinessException("Invalid review status. Must be APPROVED, REVISION_REQUESTED, or REJECTED");
        }
        
        // Update submission status
        submission.setStatus(status);
        
        // Create or update review
        DeliverableReview review = submission.getReview();
        if (review == null) {
            User brand = userRepository.findById(brandId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", brandId));
            
            review = DeliverableReview.builder()
                    .submission(submission)
                    .reviewer(brand)
                    .status(status)
                    .feedback(feedback)
                    .reviewedAt(LocalDateTime.now())
                    .build();
            
            if (status == SubmissionStatus.REVISION_REQUESTED) {
                review.setRevisionNotes(feedback);
            }
            
            submission.setReview(review);
        } else {
            review.setStatus(status);
            review.setFeedback(feedback);
            review.setReviewedAt(LocalDateTime.now());
            
            if (status == SubmissionStatus.REVISION_REQUESTED) {
                review.setRevisionNotes(feedback);
            }
        }
        
        deliverableRepository.save(submission);
        
        log.info("Deliverable reviewed: {} by brand: {} with status: {}", submissionId, brandId, status);
        
        // Send notification to creator
        String notificationTitle = switch (status) {
            case APPROVED -> "Deliverable Approved!";
            case REVISION_REQUESTED -> "Deliverable Revision Requested";
            case REJECTED -> "Deliverable Review Update";
            default -> "Deliverable Review Update";
        };
        
        sendNotification(
                submission.getApplication().getCreator().getId(),
                NotificationType.CAMPAIGN,
                notificationTitle,
                String.format("Your deliverable for campaign '%s' has been reviewed. Status: %s",
                        submission.getApplication().getCampaign().getTitle(), status),
                Map.of("deliverableId", submission.getId(), "status", status.name(), 
                       "applicationId", submission.getApplication().getId())
        );
    }
    
    // Helper methods
    
    private void enrichDeliverableDTO(DeliverableDTO dto, DeliverableSubmission submission) {
        dto.setApplicationId(submission.getApplication().getId());
        dto.setCampaignId(submission.getApplication().getCampaign().getId());
        dto.setCampaignTitle(submission.getApplication().getCampaign().getTitle());
        dto.setCreatorId(submission.getApplication().getCreator().getId());
        dto.setCreatorName(getCreatorName(submission.getApplication().getCreator()));

        // Extract file name and type from URL if needed
        if (dto.getFileUrl() != null && dto.getFileName() == null) {
            // Extract from URL or set from entity if available
            String fileName = extractFileNameFromUrl(dto.getFileUrl());
            dto.setFileName(fileName);
        }
        
        // Set version number and isLatest
        long versionCount = deliverableRepository.countByApplicationIdAndCampaignDeliverableId(
                submission.getApplication().getId(),
                submission.getCampaignDeliverable().getId()
        );
        dto.setVersionNumber((int) versionCount);
        
        // Check if this is the latest (most recent submission)
        Page<DeliverableSubmission> latestPage = deliverableRepository
                .findLatestByApplicationIdAndCampaignDeliverableId(
                        submission.getApplication().getId(),
                        submission.getCampaignDeliverable().getId(),
                        Pageable.ofSize(1)
                );
        DeliverableSubmission latest = latestPage.getContent().isEmpty() 
                ? null 
                : latestPage.getContent().get(0);
        dto.setIsLatest(latest != null && latest.getId().equals(submission.getId()));
    }
    
    private String extractFileNameFromUrl(String fileUrl) {
        if (fileUrl == null) {
            return null;
        }
        int lastSlash = fileUrl.lastIndexOf('/');
        if (lastSlash >= 0 && lastSlash < fileUrl.length() - 1) {
            return fileUrl.substring(lastSlash + 1);
        }
        return fileUrl;
    }
    
    private void sendNotification(String userId, NotificationType type, String title, String body, Map<String, Object> data) {
        try {
            notificationService.createNotification(userId, type, title, body, data);
            log.debug("Notification sent to user: {} - {}", userId, title);
        } catch (Exception e) {
            log.error("Failed to send notification to user: {}", userId, e);
            // Don't fail the main operation if notification fails
        }
    }
    
    private String getCreatorName(User creator) {
        if (creator.getUserProfile() != null) {
            return creator.getUserProfile().getFullName();
        }
        if (creator.getCreatorProfile() != null) {
            return creator.getCreatorProfile().getUsername();
        }
        return creator.getEmail();
    }
}
