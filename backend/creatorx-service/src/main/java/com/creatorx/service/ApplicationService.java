package com.creatorx.service;

import com.creatorx.common.enums.ApplicationStatus;
import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.common.enums.DocumentStatus;
import com.creatorx.common.enums.NotificationType;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.ApplicationDeadlineException;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.DuplicateApplicationException;
import com.creatorx.common.exception.KYCNotVerifiedException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.common.exception.UnauthorizedException;
import com.creatorx.repository.ApplicationRepository;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.ConversationRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.Application;
import com.creatorx.repository.entity.ApplicationFeedback;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.Conversation;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.ApplicationDTO;
import com.creatorx.service.dto.CampaignDTO;
import com.creatorx.service.mapper.ApplicationMapper;
import com.creatorx.service.mapper.CampaignMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {
    
    private final ApplicationRepository applicationRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final NotificationService notificationService;
    private final KYCService kycService;
    private final ApplicationMapper applicationMapper;
    private final CampaignMapper campaignMapper;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    private static final int MAX_ACTIVE_APPLICATIONS = 50;
    
    /**
     * Submit application to campaign
     */
    @Transactional
    public ApplicationDTO submitApplication(String creatorId, String campaignId, String pitchText, String availability) {
        // Load creator
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", creatorId));
        
        // Verify creator role
        if (creator.getRole() != UserRole.CREATOR) {
            throw new BusinessException("Only creators can submit applications");
        }
        
        // Load campaign
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", campaignId));
        
        // Business validations
        validateApplicationSubmission(creator, campaign, pitchText);
        
        // Check duplicate application
        if (applicationRepository.existsByCampaignIdAndCreatorId(campaignId, creatorId)) {
            throw new DuplicateApplicationException("You have already applied to this campaign");
        }
        
        // Check application limit
        long activeCount = applicationRepository.countActiveApplicationsByCreatorId(creatorId);
        if (activeCount >= MAX_ACTIVE_APPLICATIONS) {
            throw new BusinessException("Maximum limit of " + MAX_ACTIVE_APPLICATIONS + " active applications reached. Please withdraw some applications first.");
        }
        
        // Create application
        Application application = Application.builder()
                .campaign(campaign)
                .creator(creator)
                .status(ApplicationStatus.APPLIED)
                .pitchText(pitchText)
                .expectedTimeline(availability)
                .appliedAt(LocalDateTime.now())
                .build();
        
        Application saved = applicationRepository.save(application);
        log.info("Application submitted: {} by creator: {} to campaign: {}", saved.getId(), creatorId, campaignId);
        
        // Send notification to brand
        sendNotification(
                campaign.getBrand().getId(),
                NotificationType.APPLICATION,
                "New Application Received",
                String.format("Creator %s has applied to your campaign: %s", 
                        getCreatorName(creator), campaign.getTitle()),
                Map.of("applicationId", saved.getId(), "campaignId", campaignId, "creatorId", creatorId)
        );
        
        ApplicationDTO dto = applicationMapper.toDTO(saved);
        // Set campaign manually since we need CampaignMapper
        dto.setCampaign(campaignMapper.toDTO(saved.getCampaign()));
        return dto;
    }
    
    /**
     * Get applications for creator (paginated)
     */
    @Transactional(readOnly = true)
    public Page<ApplicationDTO> getApplications(String creatorId, Pageable pageable) {
        Page<Application> applications = applicationRepository.findByCreatorId(creatorId, pageable);
        return applications.map(app -> {
            ApplicationDTO dto = applicationMapper.toDTO(app);
            dto.setCampaign(campaignMapper.toDTO(app.getCampaign()));
            return dto;
        });
    }
    
    /**
     * Get applications by status for creator
     */
    @Transactional(readOnly = true)
    public Page<ApplicationDTO> getApplicationsByStatus(String creatorId, ApplicationStatus status, Pageable pageable) {
        Page<Application> applications = applicationRepository.findByCreatorIdAndStatus(creatorId, status, pageable);
        return applications.map(app -> {
            ApplicationDTO dto = applicationMapper.toDTO(app);
            dto.setCampaign(campaignMapper.toDTO(app.getCampaign()));
            return dto;
        });
    }
    
    /**
     * Get applications for a brand (all campaigns owned by brand)
     */
    @Transactional(readOnly = true)
    public Page<ApplicationDTO> getApplicationsForBrand(String brandId, Pageable pageable) {
        // Get all applications for campaigns owned by this brand
        Page<Application> applications = applicationRepository.findAllApplicationsForBrand(brandId, pageable);
        return applications.map(app -> {
            ApplicationDTO dto = applicationMapper.toDTO(app);
            dto.setCampaign(campaignMapper.toDTO(app.getCampaign()));
            return dto;
        });
    }
    
    /**
     * Get applications for a specific campaign (brand can see all, creator sees their own)
     */
    @Transactional(readOnly = true)
    public Page<ApplicationDTO> getApplicationsByCampaign(String campaignId, String brandId, Pageable pageable) {
        // Verify brand owns the campaign
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", campaignId));
        
        if (!campaign.getBrand().getId().equals(brandId)) {
            throw new UnauthorizedException("You can only view applications for your own campaigns");
        }
        
        List<Application> allApplications = applicationRepository.findByCampaignId(campaignId);
        
        // Convert to page manually
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allApplications.size());
        List<Application> pageContent = start < allApplications.size() 
                ? allApplications.subList(start, Math.min(end, allApplications.size()))
                : new ArrayList<>();
        
        Page<Application> applicationPage = new org.springframework.data.domain.PageImpl<>(
                pageContent, pageable, allApplications.size());
        
        return applicationPage.map(app -> {
            ApplicationDTO dto = applicationMapper.toDTO(app);
            dto.setCampaign(campaignMapper.toDTO(app.getCampaign()));
            return dto;
        });
    }
    
    /**
     * Get application by ID
     */
    @Transactional(readOnly = true)
    public ApplicationDTO getApplicationById(String id, User currentUser) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", id));
        
        // Authorization check
        checkApplicationAccess(application, currentUser);
        
        ApplicationDTO dto = applicationMapper.toDTO(application);
        dto.setCampaign(campaignMapper.toDTO(application.getCampaign()));
        return dto;
    }
    
    /**
     * Withdraw application (creator only, only from APPLIED status)
     */
    @Transactional
    public void withdrawApplication(String creatorId, String id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", id));
        
        // Verify ownership
        if (!application.getCreator().getId().equals(creatorId)) {
            throw new UnauthorizedException("You can only withdraw your own applications");
        }
        
        // Only allow withdrawal from APPLIED status
        if (application.getStatus() != ApplicationStatus.APPLIED) {
            throw new BusinessException("Cannot withdraw application. Only applications with APPLIED status can be withdrawn.");
        }
        
        application.setStatus(ApplicationStatus.WITHDRAWN);
        applicationRepository.save(application);
        
        log.info("Application withdrawn: {} by creator: {}", id, creatorId);
        
        // Send notification to brand
        sendNotification(
                application.getCampaign().getBrand().getId(),
                NotificationType.APPLICATION,
                "Application Withdrawn",
                String.format("Creator %s has withdrawn their application to campaign: %s",
                        getCreatorName(application.getCreator()), application.getCampaign().getTitle()),
                Map.of("applicationId", id, "campaignId", application.getCampaign().getId())
        );
    }
    
    /**
     * Shortlist application (brand only)
     */
    @Transactional
    public void shortlistApplication(String brandId, String id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", id));
        
        // Verify brand owns the campaign
        if (!application.getCampaign().getBrand().getId().equals(brandId)) {
            throw new UnauthorizedException("You can only manage applications for your own campaigns");
        }
        
        // Status validation
        if (application.getStatus() != ApplicationStatus.APPLIED) {
            throw new BusinessException("Only APPLIED applications can be shortlisted");
        }
        
        application.setStatus(ApplicationStatus.SHORTLISTED);
        
        // Update or create feedback
        ApplicationFeedback feedback = application.getFeedback();
        if (feedback == null) {
            feedback = ApplicationFeedback.builder()
                    .application(application)
                    .shortlistedAt(LocalDateTime.now())
                    .build();
            application.setFeedback(feedback);
        } else {
            feedback.setShortlistedAt(LocalDateTime.now());
        }
        
        applicationRepository.save(application);
        log.info("Application shortlisted: {} by brand: {}", id, brandId);
        
        // Send notification to creator
        sendNotification(
                application.getCreator().getId(),
                NotificationType.APPLICATION,
                "Application Shortlisted",
                String.format("Your application to campaign '%s' has been shortlisted!",
                        application.getCampaign().getTitle()),
                Map.of("applicationId", id, "campaignId", application.getCampaign().getId())
        );
    }
    
    /**
     * Select application (brand only, creates conversation)
     */
    @Transactional
    public void selectApplication(String brandId, String id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", id));
        
        // Verify brand owns the campaign
        if (!application.getCampaign().getBrand().getId().equals(brandId)) {
            throw new UnauthorizedException("You can only manage applications for your own campaigns");
        }
        
        // Status validation
        if (application.getStatus() != ApplicationStatus.SHORTLISTED && 
            application.getStatus() != ApplicationStatus.APPLIED) {
            throw new BusinessException("Only APPLIED or SHORTLISTED applications can be selected");
        }
        
        application.setStatus(ApplicationStatus.SELECTED);
        
        // Update or create feedback
        ApplicationFeedback feedback = application.getFeedback();
        if (feedback == null) {
            feedback = ApplicationFeedback.builder()
                    .application(application)
                    .selectedAt(LocalDateTime.now())
                    .build();
            application.setFeedback(feedback);
        } else {
            feedback.setSelectedAt(LocalDateTime.now());
        }
        
        applicationRepository.save(application);
        
        // Create conversation between creator and brand
        Conversation conversation = conversationRepository
                .findByCreatorAndBrandAndCampaign(
                        application.getCreator().getId(),
                        application.getCampaign().getBrand().getId(),
                        application.getCampaign().getId()
                )
                .orElseGet(() -> {
                    Conversation newConversation = Conversation.builder()
                            .creator(application.getCreator())
                            .brand(application.getCampaign().getBrand())
                            .campaign(application.getCampaign())
                            .creatorUnreadCount(0)
                            .brandUnreadCount(0)
                            .build();
                    return conversationRepository.save(newConversation);
                });
        
        log.info("Application selected: {} by brand: {}, conversation created: {}", id, brandId, conversation.getId());
        
        // Send notification to creator
        sendNotification(
                application.getCreator().getId(),
                NotificationType.APPLICATION,
                "Application Selected!",
                String.format("Congratulations! Your application to campaign '%s' has been selected.",
                        application.getCampaign().getTitle()),
                Map.of("applicationId", id, "campaignId", application.getCampaign().getId(), 
                       "conversationId", conversation.getId())
        );
    }
    
    /**
     * Reject application (brand only)
     */
    @Transactional
    public void rejectApplication(String brandId, String id, String reason) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", id));
        
        // Verify brand owns the campaign
        if (!application.getCampaign().getBrand().getId().equals(brandId)) {
            throw new UnauthorizedException("You can only manage applications for your own campaigns");
        }
        
        // Status validation
        if (application.getStatus() == ApplicationStatus.REJECTED || 
            application.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw new BusinessException("Application is already " + application.getStatus());
        }
        
        application.setStatus(ApplicationStatus.REJECTED);
        
        // Update or create feedback
        ApplicationFeedback feedback = application.getFeedback();
        if (feedback == null) {
            feedback = ApplicationFeedback.builder()
                    .application(application)
                    .rejectedReason(reason)
                    .rejectedAt(LocalDateTime.now())
                    .build();
            application.setFeedback(feedback);
        } else {
            feedback.setRejectedReason(reason);
            feedback.setRejectedAt(LocalDateTime.now());
        }
        
        applicationRepository.save(application);
        log.info("Application rejected: {} by brand: {}", id, brandId);
        
        // Send notification to creator
        sendNotification(
                application.getCreator().getId(),
                NotificationType.APPLICATION,
                "Application Update",
                String.format("Your application to campaign '%s' was not selected. Reason: %s",
                        application.getCampaign().getTitle(), reason != null ? reason : "Not specified"),
                Map.of("applicationId", id, "campaignId", application.getCampaign().getId())
        );
    }
    
    /**
     * Invite creator to campaign (Brand only)
     * Creates an application with APPLIED status for the invited creator
     */
    @Transactional
    public ApplicationDTO inviteCreator(String brandId, String campaignId, String creatorId, String message) {
        // Load campaign
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", campaignId));
        
        // Verify brand owns the campaign
        if (!campaign.getBrand().getId().equals(brandId)) {
            throw new UnauthorizedException("You can only invite creators to your own campaigns");
        }
        
        // Load creator
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", creatorId));
        
        // Verify creator role
        if (creator.getRole() != UserRole.CREATOR) {
            throw new BusinessException("Can only invite creators");
        }
        
        // Check if already applied
        if (applicationRepository.existsByCampaignIdAndCreatorId(campaignId, creatorId)) {
            throw new DuplicateApplicationException("Creator has already applied to this campaign");
        }
        
        // Create application with APPLIED status (invited by brand)
        String pitchText = message != null && !message.trim().isEmpty() 
                ? message 
                : "You have been invited to this campaign by the brand.";
        
        Application application = Application.builder()
                .campaign(campaign)
                .creator(creator)
                .status(ApplicationStatus.APPLIED)
                .pitchText(pitchText)
                .appliedAt(LocalDateTime.now())
                .build();
        
        application = applicationRepository.save(application);
        log.info("Creator invited to campaign: creator={}, campaign={} by brand={}", 
                creatorId, campaignId, brandId);
        
        // Send notification to creator
        sendNotification(
                creator.getId(),
                NotificationType.CAMPAIGN,
                "Campaign Invitation",
                String.format("You have been invited to apply for campaign '%s'", campaign.getTitle()),
                Map.of("campaignId", campaignId, "applicationId", application.getId())
        );
        
        return applicationMapper.toDTO(application);
    }
    
    /**
     * Update application status (Brand only)
     */
    @Transactional
    public void updateApplicationStatus(String brandId, String id, ApplicationStatus newStatus, String reason) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", id));
        
        // Verify brand owns the campaign
        if (!application.getCampaign().getBrand().getId().equals(brandId)) {
            throw new UnauthorizedException("You can only manage applications for your own campaigns");
        }
        
        // Validate status transition
        ApplicationStatus currentStatus = application.getStatus();
        if (currentStatus == ApplicationStatus.WITHDRAWN) {
            throw new BusinessException("Cannot update status of withdrawn application");
        }
        
        // Handle status update
        switch (newStatus) {
            case SHORTLISTED:
                shortlistApplication(brandId, id);
                return;
            case SELECTED:
                selectApplication(brandId, id);
                return;
            case REJECTED:
                rejectApplication(brandId, id, reason != null ? reason : "Not selected");
                return;
            case APPLIED:
                // Can revert to APPLIED from SHORTLISTED
                if (currentStatus == ApplicationStatus.SHORTLISTED) {
                    application.setStatus(ApplicationStatus.APPLIED);
                    applicationRepository.save(application);
                    log.info("Application status reverted to APPLIED: {} by brand: {}", id, brandId);
                } else {
                    throw new BusinessException("Cannot revert to APPLIED status from " + currentStatus);
                }
                break;
            default:
                throw new BusinessException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }
    }

    /**
     * Bulk update application status (Brand only)
     */
    @Transactional
    public void updateApplicationsStatusBulk(String brandId, List<String> ids, ApplicationStatus status, String reason) {
        if (ids == null || ids.isEmpty()) {
            throw new BusinessException("No application IDs provided");
        }

        for (String id : ids) {
            updateApplicationStatus(brandId, id, status, reason);
        }
    }
    
    // Helper methods
    
    private void validateApplicationSubmission(User creator, Campaign campaign, String pitchText) {
        // Check campaign status
        if (campaign.getStatus() != CampaignStatus.ACTIVE) {
            throw new BusinessException("Cannot apply to campaign. Campaign is not active.");
        }
        
        // Check deadline
        if (campaign.getApplicationDeadline() != null && 
            LocalDate.now().isAfter(campaign.getApplicationDeadline())) {
            throw new ApplicationDeadlineException("Application deadline has passed for this campaign");
        }
        
        // Check end date
        if (LocalDate.now().isAfter(campaign.getEndDate())) {
            throw new ApplicationDeadlineException("Campaign has ended");
        }
        
        // Check KYC verification
        if (!isKYCVerified(creator.getId())) {
            throw new KYCNotVerifiedException("KYC verification is required before applying to campaigns. Please complete your KYC verification first.");
        }
    }
    
    private boolean isKYCVerified(String userId) {
        // Check if user has at least one APPROVED KYC document
        return kycService.isKYCVerified(userId);
    }
    
    private void checkApplicationAccess(Application application, User currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedException("Authentication required");
        }
        
        // Creator can view their own applications
        if (currentUser.getRole() == UserRole.CREATOR) {
            if (!application.getCreator().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You can only view your own applications");
            }
        }
        // Brand can view applications to their campaigns
        else if (currentUser.getRole() == UserRole.BRAND) {
            if (!application.getCampaign().getBrand().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You can only view applications to your own campaigns");
            }
        }
        // Admins can view all
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
