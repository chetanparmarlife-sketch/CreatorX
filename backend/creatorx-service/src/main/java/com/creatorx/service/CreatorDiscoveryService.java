package com.creatorx.service;

import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.ApplicationRepository;
import com.creatorx.repository.CreatorProfileRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.CreatorProfile;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.CreatorDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for creator discovery and search
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CreatorDiscoveryService {
    
    private final CreatorProfileRepository creatorProfileRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    
    /**
     * Search creators with filters
     */
    @Transactional(readOnly = true)
    public Page<CreatorDTO> searchCreators(
            String search,
            List<String> categories,
            String platform,
            Integer minFollowers,
            Integer maxFollowers,
            Pageable pageable
    ) {
        boolean categoriesEmpty = categories == null || categories.isEmpty();
        List<String> categoriesForQuery = categoriesEmpty ? List.of("__none__") : categories;
        String normalizedSearch = search != null && !search.trim().isEmpty() ? search.trim() : null;
        String normalizedPlatform = platform != null && !platform.trim().isEmpty()
                ? platform.trim().toUpperCase()
                : null;
        if (normalizedPlatform != null
                && !List.of("INSTAGRAM", "YOUTUBE", "TIKTOK", "TWITTER").contains(normalizedPlatform)) {
            normalizedPlatform = null;
        }

        Page<CreatorProfile> profiles = creatorProfileRepository.searchCreators(
                normalizedSearch,
                categoriesForQuery,
                categoriesEmpty,
                normalizedPlatform,
                minFollowers,
                maxFollowers,
                pageable);

        Map<String, Long> totalApplications = countApplicationsByCreator(profiles.getContent(), null);
        Map<String, Long> selectedApplications = countApplicationsByCreator(
                profiles.getContent(),
                com.creatorx.common.enums.ApplicationStatus.SELECTED);

        return profiles.map(profile -> mapToDTO(
                profile,
                totalApplications.getOrDefault(profile.getUser().getId(), 0L),
                selectedApplications.getOrDefault(profile.getUser().getId(), 0L)));
    }
    
    /**
     * Get creator by ID
     */
    @Transactional(readOnly = true)
    public CreatorDTO getCreatorById(String creatorId) {
        User user = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", creatorId));
        
        CreatorProfile profile = user.getCreatorProfile();
        if (profile == null) {
            throw new ResourceNotFoundException("Creator Profile", creatorId);
        }
        
        long totalApplications = applicationRepository.findByCreatorId(user.getId(),
                org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements();
        long selectedApplications = applicationRepository.findByCreatorIdAndStatus(
                user.getId(),
                com.creatorx.common.enums.ApplicationStatus.SELECTED,
                org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements();

        return mapToDTO(profile, totalApplications, selectedApplications);
    }
    
    private CreatorDTO mapToDTO(CreatorProfile profile, long totalApplications, long selectedApplications) {
        User user = profile.getUser();
        
        // Build platforms list
        List<String> platforms = new ArrayList<>();
        if (profile.getInstagramUrl() != null) platforms.add("INSTAGRAM");
        if (profile.getYoutubeUrl() != null) platforms.add("YOUTUBE");
        if (profile.getTiktokUrl() != null) platforms.add("TIKTOK");
        if (profile.getTwitterUrl() != null) platforms.add("TWITTER");
        
        double acceptanceRate = totalApplications > 0 
                ? (double) selectedApplications / totalApplications * 100 
                : 0.0;
        
        CreatorDTO.CreatorStats stats = CreatorDTO.CreatorStats.builder()
                .totalApplications(totalApplications)
                .selectedApplications(selectedApplications)
                .acceptanceRate(acceptanceRate)
                .completedCampaigns(0L) // TODO: Calculate from completed campaigns
                .build();
        
        return CreatorDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(profile.getUsername())
                .category(profile.getCategory())
                .followerCount(profile.getFollowerCount())
                .engagementRate(profile.getEngagementRate() != null ? profile.getEngagementRate() : BigDecimal.ZERO)
                .instagramUrl(profile.getInstagramUrl())
                .youtubeUrl(profile.getYoutubeUrl())
                .tiktokUrl(profile.getTiktokUrl())
                .twitterUrl(profile.getTwitterUrl())
                .verified(profile.getVerified())
                .platforms(platforms)
                .portfolioItemsCount(profile.getPortfolioItems() != null ? profile.getPortfolioItems().size() : 0)
                .stats(stats)
                .build();
    }

    private Map<String, Long> countApplicationsByCreator(
            List<CreatorProfile> profiles,
            com.creatorx.common.enums.ApplicationStatus status) {
        if (profiles.isEmpty()) {
            return Collections.emptyMap();
        }

        List<String> creatorIds = profiles.stream()
                .map(profile -> profile.getUser().getId())
                .distinct()
                .toList();

        List<Object[]> rows = status == null
                ? applicationRepository.countByCreatorIds(creatorIds)
                : applicationRepository.countByCreatorIdsAndStatus(creatorIds, status);

        Map<String, Long> counts = new HashMap<>();
        for (Object[] row : rows) {
            counts.put((String) row[0], (Long) row[1]);
        }
        return counts;
    }
}
