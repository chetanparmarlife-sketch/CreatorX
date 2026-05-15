package com.creatorx.service;

import com.creatorx.common.dto.CampaignFilterRequest;
import com.creatorx.common.enums.CampaignPlatform;
import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.common.enums.OnboardingStatus;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.CampaignNotFoundException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.common.exception.UnauthorizedException;
import com.creatorx.common.settings.PlatformSettingKeys;
import com.creatorx.repository.ApplicationRepository;
import com.creatorx.repository.BrandProfileRepository;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.SavedCampaignRepository;
import com.creatorx.repository.entity.BrandProfile;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.CampaignDeliverable;
import com.creatorx.repository.entity.SavedCampaign;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.CampaignDTO;
import com.creatorx.service.dto.CampaignDeliverableDTO;
import com.creatorx.service.mapper.CampaignMapper;
import com.creatorx.service.admin.ModerationService;
import com.creatorx.service.util.SearchQuerySanitizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CampaignService {
    
    private final CampaignRepository campaignRepository;
    private final SavedCampaignRepository savedCampaignRepository;
    private final ApplicationRepository applicationRepository;
    private final BrandProfileRepository brandProfileRepository;
    private final UserService userService;
    private final CampaignMapper campaignMapper;
    private final SearchQuerySanitizer searchQuerySanitizer;
    private final ModerationService moderationService;
    private final PlatformSettingsResolver platformSettingsResolver;
    
    /**
     * Get campaigns with filters and pagination using CampaignFilterRequest.
     * 
     * This method retrieves a paginated list of campaigns based on the provided filters.
     * The results are filtered based on the current user's role:
     * - Creators see only ACTIVE campaigns
     * - Brands see their own campaigns and ACTIVE campaigns
     * - Admins see all campaigns
     * 
     * @param filters The filter criteria (category, platform, budget range, etc.)
     * @param pageable Pagination information (page number, size, sorting)
     * @param currentUser The authenticated user making the request
     * @return A paginated list of CampaignDTOs matching the filters
     * @throws BusinessException if invalid filter parameters are provided
     */
    @Transactional(readOnly = true)
    public Page<CampaignDTO> getCampaigns(CampaignFilterRequest filters, Pageable pageable, User currentUser) {
        // Validate page size (max 100)
        int size = Math.min(pageable.getPageSize(), 100);
        int page = pageable.getPageNumber();
        String sortBy = pageable.getSort().stream()
                .findFirst()
                .map(order -> order.getProperty())
                .orElse("created_at");
        String sortDirection = pageable.getSort().stream()
                .findFirst()
                .map(order -> order.getDirection().name().toLowerCase())
                .orElse("desc");
        
        return getCampaigns(
                filters != null ? filters.getCategory() : null,
                filters != null ? filters.getPlatform() : null,
                filters != null ? filters.getBudgetMin() : null,
                filters != null ? filters.getBudgetMax() : null,
                filters != null ? filters.getStatus() : null,
                filters != null ? filters.getSearch() : null,
                sortBy,
                sortDirection,
                page,
                size,
                currentUser
        );
    }
    
    /**
     * Get campaigns with filters and pagination.
     * 
     * Retrieves campaigns based on various filter criteria including category, platform,
     * budget range, status, and search query. Search queries are sanitized to prevent
     * SQL injection attacks. Results are paginated and sorted.
     * 
     * @param category Filter by campaign category (e.g., "Fashion", "Food")
     * @param platform Filter by platform (INSTAGRAM, YOUTUBE, etc.)
     * @param budgetMin Minimum budget filter
     * @param budgetMax Maximum budget filter
     * @param status Filter by campaign status (ACTIVE, DRAFT, etc.)
     * @param search Full-text search query (sanitized before use)
     * @param sortBy Field to sort by (budget, deadline, created_at)
     * @param sortDirection Sort direction (asc, desc)
     * @param page Page number (0-indexed)
     * @param size Page size (max 100)
     * @param currentUser The authenticated user (null for public access)
     * @return Paginated list of CampaignDTOs
     * @throws BusinessException if search query is invalid after sanitization
     */
    @Transactional(readOnly = true)
    public Page<CampaignDTO> getCampaigns(
            String category,
            CampaignPlatform platform,
            BigDecimal budgetMin,
            BigDecimal budgetMax,
            CampaignStatus status,
            String search,
            String sortBy,
            String sortDirection,
            int page,
            int size,
            User currentUser
    ) {
        // Build pageable with sorting
        Sort sort = buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Determine status filter based on user role
        CampaignStatus filterStatus = determineStatusFilter(status, currentUser);
        
        Page<Campaign> campaigns;
        
        // Use full-text search if search query provided
        if (search != null && !search.trim().isEmpty()) {
            // Sanitize search query to prevent injection attacks
            String sanitizedSearch = searchQuerySanitizer.sanitize(search);
            if (sanitizedSearch == null || sanitizedSearch.isEmpty()) {
                log.warn("Search query was invalid or empty after sanitization: {}", search);
                // Fall back to regular filter query without search
                if (currentUser != null && currentUser.getRole() == UserRole.BRAND) {
                    campaigns = campaignRepository.findAdminCampaigns(
                            currentUser.getId(),
                            filterStatus,
                            category,
                            platform,
                            budgetMin,
                            budgetMax,
                            null,
                            pageable
                    );
                } else {
                    campaigns = campaignRepository.findCampaignsByFilters(
                            filterStatus,
                            category,
                            platform,
                            budgetMin,
                            budgetMax,
                            pageable
                    );
                }
            } else {
                if (currentUser != null && currentUser.getRole() == UserRole.BRAND) {
                    campaigns = campaignRepository.findAdminCampaigns(
                            currentUser.getId(),
                            filterStatus,
                            category,
                            platform,
                            budgetMin,
                            budgetMax,
                            sanitizedSearch,
                            pageable
                    );
                } else {
                    try {
                        campaigns = campaignRepository.searchCampaignsWithFullText(
                                filterStatus != null ? filterStatus.name() : "ACTIVE",
                                category,
                                platform != null ? platform.name() : null,
                                budgetMin,
                                budgetMax,
                                sanitizedSearch,
                                pageable
                        );
                    } catch (Exception e) {
                        // Full-text search requires PostgreSQL; fall back to LIKE-based search
                        log.debug("Full-text search unavailable, falling back to LIKE-based search: {}", e.getMessage());
                        CampaignStatus fallbackStatus = filterStatus != null ? filterStatus : CampaignStatus.ACTIVE;
                        campaigns = campaignRepository.searchCampaigns(fallbackStatus, category, sanitizedSearch, pageable);
                    }
                }
            }
        } else {
            // Use regular filter query with status from role-based filter
            if (currentUser != null && currentUser.getRole() == UserRole.BRAND) {
                campaigns = campaignRepository.findAdminCampaigns(
                        currentUser.getId(),
                        filterStatus,
                        category,
                        platform,
                        budgetMin,
                        budgetMax,
                        null,
                        pageable
                );
            } else {
                campaigns = campaignRepository.findCampaignsByFilters(
                        filterStatus,
                        category,
                        platform,
                        budgetMin,
                        budgetMax,
                        pageable
                );
            }
        }
        
        return mapCampaignPage(campaigns, currentUser);
    }
    
    /**
     * Get campaign by ID with access control.
     * 
     * Retrieves a single campaign by its ID. Access is controlled based on user role:
     * - Public/Unauthenticated: Only ACTIVE campaigns
     * - Creators: Only ACTIVE campaigns
     * - Brands: Their own campaigns (any status) or ACTIVE campaigns
     * - Admins: All campaigns
     * 
     * For creators, the response includes whether the campaign is saved and application count.
     * 
     * @param id The campaign UUID
     * @param currentUser The authenticated user (null for public access)
     * @return CampaignDTO with campaign details
     * @throws CampaignNotFoundException if campaign not found
     * @throws UnauthorizedException if user doesn't have access to this campaign
     */
    @Transactional(readOnly = true)
    public CampaignDTO getCampaignById(String id, User currentUser) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new CampaignNotFoundException(id));
        
        // Authorization check
        checkCampaignAccess(campaign, currentUser);
        
        CampaignDTO dto = campaignMapper.toDTO(campaign);
        
        // Add application count for creators
        if (currentUser != null && currentUser.getRole() == UserRole.CREATOR) {
            dto.setApplicationCount((long) campaign.getApplications().size());
            dto.setIsSaved(isCampaignSaved(currentUser.getId(), id));
        }
        
        return dto;
    }
    
    /**
     * Create a new campaign.
     * 
     * Creates a new campaign for the specified brand. The campaign is initially
     * created in DRAFT status. The brand must have the BRAND role.
     * 
     * Campaign data is validated before creation:
     * - Title and description are required
     * - Budget must be positive
     * - Dates must be valid (end date after start date)
     * - Application deadline must be before campaign end date
     * 
     * Cache is evicted to ensure fresh data on next read.
     * 
     * @param campaignDTO The campaign data to create
     * @param brandId The UUID of the brand creating the campaign
     * @return The created CampaignDTO
     * @throws BusinessException if user is not a brand or validation fails
     * @throws ResourceNotFoundException if brand not found
     */
    @Transactional
    @CacheEvict(value = "campaigns", allEntries = true)
    public CampaignDTO createCampaign(CampaignDTO campaignDTO, String brandId) {
        User brand = userService.findById(brandId);
        
        // Verify user is a brand
        if (brand.getRole() != UserRole.BRAND) {
            throw new BusinessException("Only brands can create campaigns");
        }

        // Verify brand onboarding is approved
        BrandProfile brandProfile = brandProfileRepository.findById(brandId)
                .orElseThrow(() -> new BusinessException("Brand profile not found. Please complete onboarding."));
        if (brandProfile.getOnboardingStatus() != OnboardingStatus.APPROVED) {
            throw new BusinessException("Brand onboarding must be approved before creating campaigns. Current status: "
                    + brandProfile.getOnboardingStatus());
        }

        // Validate campaign data
        validateCampaignData(campaignDTO);
        
        Campaign campaign = campaignMapper.toEntity(campaignDTO);
        campaign.setBrand(brand);
        campaign.setStatus(CampaignStatus.DRAFT);
        campaign.setSelectedCreatorsCount(0);
        
        // Map deliverables if provided
        if (campaignDTO.getDeliverables() != null && !campaignDTO.getDeliverables().isEmpty()) {
            List<CampaignDeliverable> deliverables = campaignDTO.getDeliverables().stream()
                    .map(dto -> mapDeliverableDTOToEntity(dto, campaign))
                    .collect(Collectors.toList());
            campaign.setCampaignDeliverables(deliverables);
        }
        
        Campaign saved = campaignRepository.save(campaign);
        try {
            moderationService.evaluateCampaign(saved, brand);
        } catch (Exception e) {
            // Moderation should never block campaign creation
            log.warn("Moderation evaluation failed for campaign {}: {}", saved.getId(), e.getMessage(), e);
        }
        log.info("Created campaign: {} by brand: {}", saved.getId(), brandId);
        
        return campaignMapper.toDTO(saved);
    }
    
    /**
     * Update campaign
     */
    @Transactional
    @CacheEvict(value = "campaigns", allEntries = true)
    public CampaignDTO updateCampaign(String id, CampaignDTO campaignDTO, String brandId) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new CampaignNotFoundException(id));
        
        // Verify ownership
        if (!campaign.getBrand().getId().equals(brandId)) {
            throw new UnauthorizedException("You can only update your own campaigns");
        }

        // Guard: prevent updates on terminal-status campaigns
        CampaignStatus currentStatus = campaign.getStatus();
        if (currentStatus == CampaignStatus.COMPLETED || currentStatus == CampaignStatus.CANCELLED) {
            throw new BusinessException("Cannot update a " + currentStatus.name().toLowerCase() + " campaign");
        }

        // Guard: for ACTIVE campaigns, only allow status transitions (pause/cancel/complete)
        if (currentStatus == CampaignStatus.ACTIVE) {
            boolean hasFieldChanges = campaignDTO.getTitle() != null || campaignDTO.getDescription() != null
                    || campaignDTO.getBudget() != null || campaignDTO.getCategory() != null
                    || campaignDTO.getPlatform() != null || campaignDTO.getRequirements() != null
                    || campaignDTO.getDeliverableTypes() != null || campaignDTO.getStartDate() != null
                    || campaignDTO.getEndDate() != null || campaignDTO.getApplicationDeadline() != null
                    || campaignDTO.getMaxApplicants() != null || campaignDTO.getTags() != null
                    || campaignDTO.getDeliverables() != null;
            if (hasFieldChanges) {
                throw new BusinessException(
                        "Cannot modify campaign details while it is active. Pause the campaign first to make changes.");
            }
        }

        // Validate updated data if provided
        if (campaignDTO.getTitle() != null || campaignDTO.getDescription() != null ||
            campaignDTO.getBudget() != null || campaignDTO.getStartDate() != null ||
            campaignDTO.getEndDate() != null) {
            validateCampaignData(campaignDTO, campaign);
        }

        // Update fields (only reachable for DRAFT, PENDING_REVIEW, or PAUSED campaigns)
        if (campaignDTO.getTitle() != null) campaign.setTitle(campaignDTO.getTitle());
        if (campaignDTO.getDescription() != null) campaign.setDescription(campaignDTO.getDescription());
        if (campaignDTO.getBudget() != null) campaign.setBudget(campaignDTO.getBudget());
        if (campaignDTO.getCategory() != null) campaign.setCategory(campaignDTO.getCategory());
        if (campaignDTO.getPlatform() != null) campaign.setPlatform(campaignDTO.getPlatform());
        if (campaignDTO.getRequirements() != null) campaign.setRequirements(campaignDTO.getRequirements());
        if (campaignDTO.getDeliverableTypes() != null) campaign.setDeliverableTypes(campaignDTO.getDeliverableTypes());
        if (campaignDTO.getStartDate() != null) campaign.setStartDate(campaignDTO.getStartDate());
        if (campaignDTO.getEndDate() != null) campaign.setEndDate(campaignDTO.getEndDate());
        if (campaignDTO.getApplicationDeadline() != null) campaign.setApplicationDeadline(campaignDTO.getApplicationDeadline());
        if (campaignDTO.getMaxApplicants() != null) campaign.setMaxApplicants(campaignDTO.getMaxApplicants());
        if (campaignDTO.getTags() != null) campaign.setTags(campaignDTO.getTags());
        if (campaignDTO.getStatus() != null && campaign.getStatus() != CampaignStatus.COMPLETED) {
            if (campaignDTO.getStatus() == CampaignStatus.ACTIVE && campaign.getStatus() != CampaignStatus.ACTIVE) {
                boolean requiresApproval = platformSettingsResolver.isFeatureEnabled(
                        PlatformSettingKeys.FEATURE_CAMPAIGN_PREAPPROVAL,
                        true
                );
                if (requiresApproval) {
                    campaign.setStatus(CampaignStatus.PENDING_REVIEW);
                    campaign.setReviewReason(null);
                    campaign.setReviewedBy(null);
                    campaign.setReviewedAt(null);
                } else {
                    campaign.setStatus(CampaignStatus.ACTIVE);
                }
            } else if (campaignDTO.getStatus() == CampaignStatus.PENDING_REVIEW
                    && campaign.getStatus() == CampaignStatus.DRAFT) {
                // Explicit submit-for-review from DRAFT
                campaign.setStatus(CampaignStatus.PENDING_REVIEW);
                campaign.setReviewReason(null);
                campaign.setReviewedBy(null);
                campaign.setReviewedAt(null);
            } else if (campaignDTO.getStatus() != CampaignStatus.PENDING_REVIEW) {
                campaign.setStatus(campaignDTO.getStatus());
            }
        }
        
        // Update deliverables if provided
        if (campaignDTO.getDeliverables() != null) {
            campaign.getCampaignDeliverables().clear();
            campaignDTO.getDeliverables().forEach(dto -> {
                CampaignDeliverable deliverable = mapDeliverableDTOToEntity(dto, campaign);
                campaign.getCampaignDeliverables().add(deliverable);
            });
        }
        
        Campaign updated = campaignRepository.save(campaign);
        try {
            moderationService.evaluateCampaign(updated, campaign.getBrand());
        } catch (Exception e) {
            // Moderation should never block campaign updates
            log.warn("Moderation evaluation failed for campaign {}: {}", updated.getId(), e.getMessage(), e);
        }
        log.info("Updated campaign: {} by brand: {}", id, brandId);
        
        return campaignMapper.toDTO(updated);
    }
    
    /**
     * Delete campaign
     */
    @Transactional
    @CacheEvict(value = "campaigns", allEntries = true)
    public void deleteCampaign(String id, String brandId) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new CampaignNotFoundException(id));
        
        // Verify ownership
        if (!campaign.getBrand().getId().equals(brandId)) {
            throw new UnauthorizedException("You can only delete your own campaigns");
        }
        
        // Prevent deletion of active campaigns
        if (campaign.getStatus() == CampaignStatus.ACTIVE) {
            throw new BusinessException("Cannot delete active campaigns. Please complete or cancel first.");
        }
        
        // Check if campaign has applications
        long applicationCount = applicationRepository.countByCampaignId(id);
        if (applicationCount > 0) {
            throw new BusinessException("Cannot delete campaign with existing applications. Please cancel or complete the campaign first.");
        }
        
        campaignRepository.delete(campaign);
        log.info("Deleted campaign: {} by brand: {}", id, brandId);
    }
    
    /**
     * Save campaign (add to favorites)
     */
    @Transactional
    public void saveCampaign(String creatorId, String campaignId) {
        // Verify campaign exists and is active
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new CampaignNotFoundException(campaignId));
        
        if (campaign.getStatus() != CampaignStatus.ACTIVE) {
            throw new BusinessException("Only active campaigns can be saved");
        }
        
        // Check if already saved
        if (savedCampaignRepository.existsByCreatorIdAndCampaignId(creatorId, campaignId)) {
            throw new BusinessException("Campaign is already saved");
        }
        
        User creator = userService.findById(creatorId);
        
        SavedCampaign savedCampaign = SavedCampaign.builder()
                .creator(creator)
                .campaign(campaign)
                .build();
        
        savedCampaignRepository.save(savedCampaign);
        log.info("Saved campaign: {} by creator: {}", campaignId, creatorId);
    }
    
    /**
     * Unsave campaign (remove from favorites)
     */
    @Transactional
    public void unsaveCampaign(String creatorId, String campaignId) {
        SavedCampaign savedCampaign = savedCampaignRepository
                .findByCreatorIdAndCampaignId(creatorId, campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved campaign", campaignId));
        
        savedCampaignRepository.delete(savedCampaign);
        log.info("Unsaved campaign: {} by creator: {}", campaignId, creatorId);
    }
    
    /**
     * Get saved campaigns for creator
     */
    @Transactional(readOnly = true)
    public List<CampaignDTO> getSavedCampaigns(String creatorId) {
        List<Campaign> campaigns = savedCampaignRepository.findCampaignsByCreatorId(creatorId);
        return campaignMapper.toDTOList(campaigns);
    }
    
    /**
     * Search campaigns with full-text search
     */
    @Transactional(readOnly = true)
    public Page<CampaignDTO> searchCampaigns(String query, Pageable pageable, User currentUser) {
        // Validate page size (max 100)
        int size = Math.min(pageable.getPageSize(), 100);
        int page = pageable.getPageNumber();
        Sort sort = pageable.getSort().isSorted() 
                ? pageable.getSort() 
                : Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable validatedPageable = PageRequest.of(page, size, sort);
        
        // Sanitize search query
        String sanitizedQuery = searchQuerySanitizer.sanitize(query);
        if (sanitizedQuery == null || sanitizedQuery.isEmpty()) {
            log.warn("Invalid search query: {}", query);
            throw new com.creatorx.common.exception.BusinessException("Invalid search query");
        }
        
        CampaignStatus filterStatus = determineStatusFilter(null, currentUser);

        Page<Campaign> campaigns;
        try {
            campaigns = campaignRepository.searchCampaignsWithFullText(
                    filterStatus != null ? filterStatus.name() : "ACTIVE",
                    null, // category
                    null, // platform
                    null, // budgetMin
                    null, // budgetMax
                    sanitizedQuery,
                    validatedPageable
            );
        } catch (Exception e) {
            // Full-text search requires PostgreSQL; fall back to LIKE-based search for H2/other DBs
            log.debug("Full-text search unavailable, falling back to LIKE-based search: {}", e.getMessage());
            CampaignStatus status = filterStatus != null ? filterStatus : CampaignStatus.ACTIVE;
            campaigns = campaignRepository.searchCampaigns(status, null, sanitizedQuery, validatedPageable);
        }

        return mapCampaignPage(campaigns, currentUser);
    }
    
    /**
     * Get active campaigns for a creator (campaigns they can apply to)
     */
    @Transactional(readOnly = true)
    public List<CampaignDTO> getActiveCampaigns(String creatorId) {
        // Get all active campaigns
        Pageable pageable = PageRequest.of(0, 1000, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Campaign> activeCampaigns = campaignRepository.findByStatus(CampaignStatus.ACTIVE, pageable);
        Set<String> savedIds = activeCampaigns.hasContent()
                ? new HashSet<>(savedCampaignRepository.findSavedCampaignIds(
                        creatorId,
                        activeCampaigns.getContent().stream().map(Campaign::getId).toList()))
                : Set.of();
        
        // Map to DTOs and enrich with saved status
        return activeCampaigns.getContent().stream()
                .map(campaignMapper::toDTO)
                .peek(dto -> dto.setIsSaved(savedIds.contains(dto.getId())))
                .collect(Collectors.toList());
    }
    
    // Helper methods
    
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
    
    private CampaignStatus determineStatusFilter(CampaignStatus requestedStatus, User currentUser) {
        if (currentUser == null) {
            return CampaignStatus.ACTIVE; // Public access only sees active
        }
        
        if (currentUser.getRole() == UserRole.CREATOR) {
            return CampaignStatus.ACTIVE; // Creators only see active campaigns
        }
        
        if (currentUser.getRole() == UserRole.BRAND) {
            return requestedStatus != null ? requestedStatus : null; // Brands can filter by status
        }
        
        if (currentUser.getRole() == UserRole.ADMIN) {
            return requestedStatus; // Admins can see all
        }
        
        return CampaignStatus.ACTIVE;
    }
    
    private void checkCampaignAccess(Campaign campaign, User currentUser) {
        if (currentUser == null) {
            // Public access - only active campaigns
            if (campaign.getStatus() != CampaignStatus.ACTIVE) {
                throw new UnauthorizedException("Campaign is not available");
            }
            return;
        }
        
        if (currentUser.getRole() == UserRole.CREATOR) {
            // Creators can only view active campaigns
            if (campaign.getStatus() != CampaignStatus.ACTIVE) {
                throw new UnauthorizedException("Campaign is not available");
            }
        } else if (currentUser.getRole() == UserRole.BRAND) {
            // Brands can view their own campaigns regardless of status
            if (!campaign.getBrand().getId().equals(currentUser.getId())) {
                if (campaign.getStatus() != CampaignStatus.ACTIVE) {
                    throw new UnauthorizedException("Campaign is not available");
                }
            }
        }
        // Admins can view all campaigns
    }
    
    private boolean isCampaignSaved(String creatorId, String campaignId) {
        return savedCampaignRepository.existsByCreatorIdAndCampaignId(creatorId, campaignId);
    }

    private Page<CampaignDTO> mapCampaignPage(Page<Campaign> campaigns, User currentUser) {
        Set<String> savedIds = Set.of();
        if (currentUser != null && currentUser.getRole() == UserRole.CREATOR && campaigns.hasContent()) {
            List<String> campaignIds = campaigns.getContent().stream()
                    .map(Campaign::getId)
                    .toList();
            savedIds = new HashSet<>(savedCampaignRepository.findSavedCampaignIds(currentUser.getId(), campaignIds));
        }

        Set<String> finalSavedIds = savedIds;
        return campaigns.map(campaign -> {
            CampaignDTO dto = campaignMapper.toDTO(campaign);
            if (currentUser != null && currentUser.getRole() == UserRole.CREATOR) {
                dto.setIsSaved(finalSavedIds.contains(campaign.getId()));
            }
            return dto;
        });
    }
    
    private CampaignDeliverable mapDeliverableDTOToEntity(CampaignDeliverableDTO dto, Campaign campaign) {
        CampaignDeliverable.DeliverableType type = CampaignDeliverable.DeliverableType.valueOf(dto.getType().name());

        // Validate deliverable due date against campaign date range
        if (dto.getDueDate() != null) {
            if (campaign.getStartDate() != null && dto.getDueDate().isBefore(campaign.getStartDate())) {
                throw new BusinessException(
                        "Deliverable \"" + dto.getTitle() + "\" due date cannot be before the campaign start date");
            }
            if (campaign.getEndDate() != null && dto.getDueDate().isAfter(campaign.getEndDate())) {
                throw new BusinessException(
                        "Deliverable \"" + dto.getTitle() + "\" due date cannot be after the campaign end date");
            }
        }

        return CampaignDeliverable.builder()
                .campaign(campaign)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .type(type)
                .dueDate(dto.getDueDate())
                .isMandatory(dto.getIsMandatory() != null ? dto.getIsMandatory() : true)
                .orderIndex(dto.getOrderIndex() != null ? dto.getOrderIndex() : 0)
                .price(dto.getPrice())
                .build();
    }
    
    /**
     * Validate campaign data
     */
    private void validateCampaignData(CampaignDTO dto) {
        validateCampaignData(dto, null);
    }
    
    /**
     * Validate campaign data (for updates, merge with existing campaign)
     */
    private void validateCampaignData(CampaignDTO dto, Campaign existing) {
        // Title validation
        if (dto.getTitle() != null) {
            if (dto.getTitle().length() < 5 || dto.getTitle().length() > 100) {
                throw new BusinessException("Title must be between 5 and 100 characters");
            }
        } else if (existing == null) {
            throw new BusinessException("Title is required");
        }
        
        // Description validation
        if (dto.getDescription() != null) {
            if (dto.getDescription().length() < 20 || dto.getDescription().length() > 2000) {
                throw new BusinessException("Description must be between 20 and 2000 characters");
            }
        } else if (existing == null) {
            throw new BusinessException("Description is required");
        }
        
        // Budget validation
        if (dto.getBudget() != null) {
            if (dto.getBudget().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("Budget must be greater than 0");
            }
        } else if (existing == null) {
            throw new BusinessException("Budget is required");
        }
        
        // Date validation
        if (dto.getStartDate() != null && dto.getEndDate() != null) {
            if (dto.getEndDate().isBefore(dto.getStartDate()) || dto.getEndDate().isEqual(dto.getStartDate())) {
                throw new BusinessException("End date must be after start date");
            }
        } else if (existing != null) {
            // For updates, validate against existing dates if new dates are provided
            if (dto.getStartDate() != null && existing.getEndDate() != null) {
                if (existing.getEndDate().isBefore(dto.getStartDate()) || existing.getEndDate().isEqual(dto.getStartDate())) {
                    throw new BusinessException("End date must be after start date");
                }
            }
            if (dto.getEndDate() != null && existing.getStartDate() != null) {
                if (dto.getEndDate().isBefore(existing.getStartDate()) || dto.getEndDate().isEqual(existing.getStartDate())) {
                    throw new BusinessException("End date must be after start date");
                }
            }
        } else {
            if (dto.getStartDate() == null || dto.getEndDate() == null) {
                throw new BusinessException("Start date and end date are required");
            }
        }
        
        // Required fields for creation
        if (existing == null) {
            if (dto.getPlatform() == null) {
                throw new BusinessException("Platform is required");
            }
            if (dto.getCategory() == null || dto.getCategory().trim().isEmpty()) {
                throw new BusinessException("Category is required");
            }
        }

        if (dto.getCategory() != null && !platformSettingsResolver.isCategoryAllowed(dto.getCategory())) {
            throw new BusinessException("Category is not allowed");
        }
    }
}
