package com.creatorx.service;

import com.creatorx.common.enums.UserRole;
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
import java.util.List;
import java.util.stream.Collectors;

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
     * Note: This implementation filters after pagination for simplicity.
     * In production, move filtering to repository query level for better performance.
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
        // For now, fetch all and filter (inefficient but works)
        // TODO: Move to Criteria API or native query for production
        List<CreatorProfile> allProfiles = creatorProfileRepository.findAll();
        
        // Apply filters
        List<CreatorProfile> filtered = allProfiles.stream()
                .filter(profile -> {
                    // Null safety checks
                    if (profile.getUsername() == null || profile.getCategory() == null) {
                        return false;
                    }
                    
                    // Search filter
                    if (search != null && !search.trim().isEmpty()) {
                        String searchLower = search.toLowerCase();
                        boolean matchesSearch = 
                                profile.getUsername().toLowerCase().contains(searchLower) ||
                                profile.getCategory().toLowerCase().contains(searchLower) ||
                                (profile.getUser() != null && 
                                 profile.getUser().getEmail() != null && 
                                 profile.getUser().getEmail().toLowerCase().contains(searchLower));
                        if (!matchesSearch) return false;
                    }
                    
                    // Category filter
                    if (categories != null && !categories.isEmpty()) {
                        if (!categories.contains(profile.getCategory())) {
                            return false;
                        }
                    }
                    
                    // Platform filter (check social media URLs)
                    if (platform != null && !platform.trim().isEmpty()) {
                        boolean hasPlatform = switch (platform.toUpperCase()) {
                            case "INSTAGRAM" -> profile.getInstagramUrl() != null;
                            case "YOUTUBE" -> profile.getYoutubeUrl() != null;
                            case "TIKTOK" -> profile.getTiktokUrl() != null;
                            case "TWITTER" -> profile.getTwitterUrl() != null;
                            default -> true;
                        };
                        if (!hasPlatform) return false;
                    }
                    
                    // Follower count filter
                    if (minFollowers != null && profile.getFollowerCount() < minFollowers) {
                        return false;
                    }
                    if (maxFollowers != null && profile.getFollowerCount() > maxFollowers) {
                        return false;
                    }
                    
                    return true;
                })
                .collect(Collectors.toList());
        
        // Apply pagination manually
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filtered.size());
        List<CreatorProfile> pageContent = start < filtered.size() 
                ? filtered.subList(start, Math.min(end, filtered.size()))
                : new ArrayList<>();
        
        // Map to DTOs
        List<CreatorDTO> dtos = pageContent.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        
        // Create a custom page with correct total
        return new org.springframework.data.domain.PageImpl<>(dtos, pageable, filtered.size());
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
        
        return mapToDTO(profile);
    }
    
    private CreatorDTO mapToDTO(CreatorProfile profile) {
        User user = profile.getUser();
        
        // Build platforms list
        List<String> platforms = new ArrayList<>();
        if (profile.getInstagramUrl() != null) platforms.add("INSTAGRAM");
        if (profile.getYoutubeUrl() != null) platforms.add("YOUTUBE");
        if (profile.getTiktokUrl() != null) platforms.add("TIKTOK");
        if (profile.getTwitterUrl() != null) platforms.add("TWITTER");
        
        // Calculate stats
        long totalApplications = applicationRepository.findByCreatorId(user.getId(), 
                org.springframework.data.domain.PageRequest.of(0, 1000)).getTotalElements();
        long selectedApplications = applicationRepository.findByCreatorIdAndStatus(
                user.getId(), 
                com.creatorx.common.enums.ApplicationStatus.SELECTED,
                org.springframework.data.domain.PageRequest.of(0, 1000)).getTotalElements();
        
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
}

