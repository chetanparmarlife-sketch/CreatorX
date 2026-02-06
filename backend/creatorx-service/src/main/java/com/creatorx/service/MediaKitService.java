package com.creatorx.service;

import com.creatorx.repository.MediaKitRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.SocialAccountRepository;
import com.creatorx.repository.entity.MediaKit;
import com.creatorx.repository.entity.User;
import com.creatorx.repository.entity.SocialAccount;
import com.creatorx.service.dto.MediaKitDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service for Media Kit operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MediaKitService {

    private final MediaKitRepository mediaKitRepository;
    private final UserRepository userRepository;
    private final SocialAccountRepository socialAccountRepository;

    /**
     * Get media kit for current user
     */
    @Transactional(readOnly = true)
    public Optional<MediaKitDTO> getMediaKit(String userId) {
        return mediaKitRepository.findByUserId(userId)
                .map(this::toDTO);
    }

    /**
     * Get public media kit by user ID
     */
    @Transactional(readOnly = true)
    public Optional<MediaKitDTO> getPublicMediaKit(String userId) {
        return mediaKitRepository.findPublicByUserId(userId)
                .map(this::toDTO);
    }

    /**
     * Create or update media kit
     */
    @Transactional
    public MediaKitDTO saveMediaKit(String userId, MediaKitDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        MediaKit mediaKit = mediaKitRepository.findByUserId(userId)
                .orElse(MediaKit.builder().user(user).build());

        // Update fields from DTO
        updateEntityFromDTO(mediaKit, dto);

        // Sync social stats from connected accounts
        syncSocialStats(mediaKit, userId);

        MediaKit saved = mediaKitRepository.save(mediaKit);
        log.info("Saved media kit for user: {}", userId);

        return toDTO(saved);
    }

    /**
     * Update pricing rates only
     */
    @Transactional
    public MediaKitDTO updatePricing(String userId, MediaKitDTO dto) {
        MediaKit mediaKit = mediaKitRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Media kit not found for user: " + userId));

        mediaKit.setReelRate(dto.getReelRate());
        mediaKit.setStoryRate(dto.getStoryRate());
        mediaKit.setPostRate(dto.getPostRate());
        mediaKit.setYoutubeRate(dto.getYoutubeRate());
        mediaKit.setShortRate(dto.getShortRate());
        mediaKit.setLiveRate(dto.getLiveRate());

        if (dto.getCustomRates() != null) {
            mediaKit.setCustomRates(dto.getCustomRates());
        }

        MediaKit saved = mediaKitRepository.save(mediaKit);
        log.info("Updated pricing for user: {}", userId);

        return toDTO(saved);
    }

    /**
     * Refresh social stats from connected accounts
     */
    @Transactional
    public MediaKitDTO refreshSocialStats(String userId) {
        MediaKit mediaKit = mediaKitRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Media kit not found for user: " + userId));

        syncSocialStats(mediaKit, userId);

        MediaKit saved = mediaKitRepository.save(mediaKit);
        log.info("Refreshed social stats for user: {}", userId);

        return toDTO(saved);
    }

    /**
     * Toggle visibility
     */
    @Transactional
    public MediaKitDTO toggleVisibility(String userId, boolean isPublic) {
        MediaKit mediaKit = mediaKitRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Media kit not found for user: " + userId));

        mediaKit.setIsPublic(isPublic);
        MediaKit saved = mediaKitRepository.save(mediaKit);

        log.info("Set media kit visibility to {} for user: {}", isPublic, userId);
        return toDTO(saved);
    }

    /**
     * Delete media kit
     */
    @Transactional
    public void deleteMediaKit(String userId) {
        mediaKitRepository.deleteByUserId(userId);
        log.info("Deleted media kit for user: {}", userId);
    }

    // ========== Private Methods ==========

    private void updateEntityFromDTO(MediaKit entity, MediaKitDTO dto) {
        if (dto.getDisplayName() != null)
            entity.setDisplayName(dto.getDisplayName());
        if (dto.getBio() != null)
            entity.setBio(dto.getBio());
        if (dto.getTagline() != null)
            entity.setTagline(dto.getTagline());
        if (dto.getProfileImageUrl() != null)
            entity.setProfileImageUrl(dto.getProfileImageUrl());
        if (dto.getPrimaryCategory() != null)
            entity.setPrimaryCategory(dto.getPrimaryCategory());
        if (dto.getCategories() != null)
            entity.setCategories(dto.getCategories());
        if (dto.getReelRate() != null)
            entity.setReelRate(dto.getReelRate());
        if (dto.getStoryRate() != null)
            entity.setStoryRate(dto.getStoryRate());
        if (dto.getPostRate() != null)
            entity.setPostRate(dto.getPostRate());
        if (dto.getYoutubeRate() != null)
            entity.setYoutubeRate(dto.getYoutubeRate());
        if (dto.getShortRate() != null)
            entity.setShortRate(dto.getShortRate());
        if (dto.getLiveRate() != null)
            entity.setLiveRate(dto.getLiveRate());
        if (dto.getCustomRates() != null)
            entity.setCustomRates(dto.getCustomRates());
        if (dto.getPortfolioUrls() != null)
            entity.setPortfolioUrls(dto.getPortfolioUrls());
        if (dto.getContactEmail() != null)
            entity.setContactEmail(dto.getContactEmail());
        if (dto.getCity() != null)
            entity.setCity(dto.getCity());
        if (dto.getCountry() != null)
            entity.setCountry(dto.getCountry());
        if (dto.getIsPublic() != null)
            entity.setIsPublic(dto.getIsPublic());
    }

    private void syncSocialStats(MediaKit mediaKit, String userId) {
        try {
            List<SocialAccount> accounts = socialAccountRepository.findAllByUserId(userId);

            int totalFollowers = 0;
            double totalEngagement = 0.0;
            int accountCount = 0;
            Map<String, Object> statsMap = new HashMap<>();

            for (SocialAccount account : accounts) {
                if (account.getFollowerCount() != null) {
                    totalFollowers += account.getFollowerCount();
                }
                if (account.getEngagementRate() != null) {
                    totalEngagement += account.getEngagementRate();
                    accountCount++;
                }

                // Store per-platform stats
                Map<String, Object> platformStats = new HashMap<>();
                platformStats.put("followers", account.getFollowerCount());
                platformStats.put("engagementRate", account.getEngagementRate());
                platformStats.put("username", account.getUsername());
                statsMap.put(account.getProvider().name(), platformStats);
            }

            mediaKit.setTotalFollowers(totalFollowers);
            mediaKit.setSocialStats(statsMap);

            if (accountCount > 0) {
                BigDecimal avgEngagement = BigDecimal.valueOf(totalEngagement / accountCount)
                        .setScale(2, RoundingMode.HALF_UP);
                mediaKit.setAvgEngagementRate(avgEngagement);
            }
        } catch (Exception e) {
            log.warn("Failed to sync social stats for user {}: {}", userId, e.getMessage());
        }
    }

    private MediaKitDTO toDTO(MediaKit entity) {
        return MediaKitDTO.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .displayName(entity.getDisplayName())
                .bio(entity.getBio())
                .tagline(entity.getTagline())
                .profileImageUrl(entity.getProfileImageUrl())
                .primaryCategory(entity.getPrimaryCategory())
                .categories(entity.getCategories())
                .reelRate(entity.getReelRate())
                .storyRate(entity.getStoryRate())
                .postRate(entity.getPostRate())
                .youtubeRate(entity.getYoutubeRate())
                .shortRate(entity.getShortRate())
                .liveRate(entity.getLiveRate())
                .customRates(entity.getCustomRates())
                .totalFollowers(entity.getTotalFollowers())
                .avgEngagementRate(entity.getAvgEngagementRate())
                .socialStats(entity.getSocialStats())
                .portfolioUrls(entity.getPortfolioUrls())
                .contactEmail(entity.getContactEmail())
                .city(entity.getCity())
                .country(entity.getCountry())
                .isPublic(entity.getIsPublic())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
