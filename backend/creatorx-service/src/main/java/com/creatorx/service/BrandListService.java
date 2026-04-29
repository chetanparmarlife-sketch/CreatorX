package com.creatorx.service;

import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.common.exception.UnauthorizedException;
import com.creatorx.repository.BrandListCreatorRepository;
import com.creatorx.repository.BrandListRepository;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.TeamMemberRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.BrandList;
import com.creatorx.repository.entity.BrandListCreator;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.TeamMember;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.BrandListResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * BrandListService.
 *
 * Business logic for shared brand creator lists. It creates lists, adds/removes
 * creators, and fetches lists from the database so shortlist data is no longer
 * trapped in browser localStorage.
 *
 * Security rule: every operation resolves and scopes by the acting user's brand
 * ID, so brands can only read and modify their own lists.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BrandListService {
    private static final String DEFAULT_LIST_NAME = "Shortlist";

    private final BrandListRepository brandListRepository;
    private final BrandListCreatorRepository brandListCreatorRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final TeamMemberRepository teamMemberRepository;

    /**
     * Get all lists for the acting brand, optionally filtered by campaign.
     */
    @Transactional(readOnly = true)
    public List<BrandListResponse> getLists(String actingUserId, String campaignId) {
        String brandId = resolveBrandId(actingUserId);
        if (campaignId != null && !campaignId.isBlank()) {
            validateCampaignBelongsToBrand(brandId, campaignId);
        }

        List<BrandList> lists = campaignId != null && !campaignId.isBlank()
                ? brandListRepository.findByBrandIdAndCampaignIdOrderByCreatedAtDesc(brandId, campaignId)
                : brandListRepository.findByBrandIdOrderByCreatedAtDesc(brandId);

        return lists.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Add a creator to a shortlist, creating the matching list if needed.
     * Duplicate adds are idempotent so repeated clicks do not create duplicates.
     */
    @Transactional
    public BrandListResponse addToShortlist(String actingUserId, String creatorId, String campaignId, String listName) {
        String brandId = resolveBrandId(actingUserId);
        User brand = findUser(brandId, "Brand");
        User addedBy = findUser(actingUserId, "User");
        User creator = findUser(creatorId, "Creator");

        if (creator.getRole() != UserRole.CREATOR) {
            throw new BusinessException("Only creator users can be added to a brand list");
        }

        Campaign campaign = null;
        if (campaignId != null && !campaignId.isBlank()) {
            campaign = validateCampaignBelongsToBrand(brandId, campaignId);
        }

        BrandList list = findOrCreateList(brand, campaign, listName, addedBy);

        if (!brandListCreatorRepository.existsByListIdAndCreatorId(list.getId(), creatorId)) {
            BrandListCreator entry = BrandListCreator.builder()
                    .list(list)
                    .creatorId(creatorId)
                    .addedBy(addedBy)
                    .build();
            brandListCreatorRepository.save(entry);
            brandListRepository.save(list);
            log.info("Creator {} added to brand list {} by user {}", creatorId, list.getId(), actingUserId);
        }

        return toResponse(list);
    }

    /**
     * Remove a creator from the acting brand's shortlist.
     * If no campaign is supplied, the creator is removed from every matching
     * brand list owned by that brand.
     */
    @Transactional
    public void removeFromShortlist(String actingUserId, String creatorId, String campaignId) {
        String brandId = resolveBrandId(actingUserId);
        if (campaignId != null && !campaignId.isBlank()) {
            validateCampaignBelongsToBrand(brandId, campaignId);
        }

        List<BrandList> lists = campaignId != null && !campaignId.isBlank()
                ? brandListRepository.findByBrandIdAndCampaignIdOrderByCreatedAtDesc(brandId, campaignId)
                : brandListRepository.findByBrandIdOrderByCreatedAtDesc(brandId);

        lists.forEach(list -> brandListCreatorRepository.deleteByListIdAndCreatorId(list.getId(), creatorId));
        log.info("Creator {} removed from brand lists for brand {}", creatorId, brandId);
    }

    /**
     * Find an existing list for the same brand/campaign scope or create a new
     * one. Campaign-specific shortlists never reuse the global shortlist.
     */
    private BrandList findOrCreateList(User brand, Campaign campaign, String listName, User createdBy) {
        List<BrandList> existing = campaign != null
                ? brandListRepository.findByBrandIdAndCampaignIdOrderByCreatedAtDesc(brand.getId(), campaign.getId())
                : brandListRepository.findByBrandIdAndCampaignIdIsNullOrderByCreatedAtDesc(brand.getId());

        if (!existing.isEmpty()) {
            return existing.get(0);
        }

        BrandList newList = BrandList.builder()
                .brand(brand)
                .campaign(campaign)
                .name(normalizeListName(listName))
                .createdBy(createdBy)
                .build();
        return brandListRepository.save(newList);
    }

    /**
     * Convert the persisted entity into the JSON shape expected by the brand
     * dashboard.
     */
    private BrandListResponse toResponse(BrandList list) {
        List<BrandListCreator> creators = brandListCreatorRepository.findByListId(list.getId());
        return BrandListResponse.builder()
                .id(list.getId())
                .brandId(list.getBrand().getId())
                .campaignId(list.getCampaign() != null ? list.getCampaign().getId() : null)
                .name(list.getName())
                .creatorIds(creators.stream()
                        .map(BrandListCreator::getCreatorId)
                        .collect(Collectors.toList()))
                .creatorCount(creators.size())
                .createdAt(list.getCreatedAt())
                .updatedAt(list.getUpdatedAt())
                .build();
    }

    /**
     * Resolve the shared brand owner ID for a user. Team members use their
     * parent brand ID so shared shortlists are visible to the whole team.
     */
    private String resolveBrandId(String actingUserId) {
        return teamMemberRepository.findByUserId(actingUserId).stream()
                .filter(member -> "ACTIVE".equals(member.getStatus()))
                .map(TeamMember::getBrand)
                .map(User::getId)
                .findFirst()
                .orElse(actingUserId);
    }

    /**
     * Validate that an optional campaign belongs to the resolved brand before a
     * list can be read or modified for that campaign.
     */
    private Campaign validateCampaignBelongsToBrand(String brandId, String campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", campaignId));
        if (campaign.getBrand() == null || !brandId.equals(campaign.getBrand().getId())) {
            throw new UnauthorizedException("Brands can only manage lists for their own campaigns");
        }
        return campaign;
    }

    /**
     * Fetch a user by ID with a clear resource name for API error responses.
     */
    private User findUser(String userId, String resourceName) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(resourceName, userId));
    }

    /**
     * Keep empty list names from overwriting the product default.
     */
    private String normalizeListName(String listName) {
        if (listName == null || listName.isBlank()) {
            return DEFAULT_LIST_NAME;
        }
        return listName.trim();
    }
}
