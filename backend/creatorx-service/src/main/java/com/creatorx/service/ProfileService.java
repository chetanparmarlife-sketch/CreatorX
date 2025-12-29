package com.creatorx.service;

import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.common.exception.UnauthorizedException;
import com.creatorx.repository.BrandProfileRepository;
import com.creatorx.repository.CreatorProfileRepository;
import com.creatorx.repository.UserProfileRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.BrandProfile;
import com.creatorx.repository.entity.CreatorProfile;
import com.creatorx.repository.entity.User;
import com.creatorx.repository.entity.UserProfile;
import com.creatorx.service.dto.*;
import com.creatorx.service.storage.SupabaseStorageService;
import com.creatorx.service.util.ProfileValidationUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService {
    
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final BrandProfileRepository brandProfileRepository;
    private final SupabaseStorageService storageService;
    private final ObjectMapper objectMapper;
    
    // User Profile Methods
    
    /**
     * Get user profile
     */
    @Transactional(readOnly = true)
    public UserProfileDTO getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        UserProfile profile = user.getUserProfile();
        if (profile == null) {
            // Create default profile if doesn't exist
            profile = UserProfile.builder()
                    .user(user)
                    .fullName(user.getEmail().split("@")[0]) // Default name from email
                    .build();
            profile = userProfileRepository.save(profile);
        }
        
        return toUserProfileDTO(user, profile);
    }
    
    /**
     * Update user profile
     */
    @Transactional
    public UserProfileDTO updateProfile(String userId, String fullName, String phone, String bio) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        // Validate inputs
        if (bio != null) {
            ProfileValidationUtil.validateBio(bio);
        }
        if (phone != null) {
            ProfileValidationUtil.validatePhone(phone);
        }
        
        UserProfile profile = user.getUserProfile();
        if (profile == null) {
            profile = UserProfile.builder()
                    .user(user)
                    .build();
        }
        
        if (fullName != null) {
            profile.setFullName(fullName);
        }
        if (phone != null) {
            user.setPhone(phone);
            userRepository.save(user);
        }
        if (bio != null) {
            profile.setBio(bio);
        }
        
        profile = userProfileRepository.save(profile);
        
        log.info("User profile updated: {}", userId);
        return toUserProfileDTO(user, profile);
    }
    
    /**
     * Upload avatar
     */
    @Transactional
    public String uploadAvatar(String userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        // Delete old avatar if exists
        UserProfile profile = user.getUserProfile();
        if (profile != null && profile.getAvatarUrl() != null) {
            try {
                storageService.deleteFile(profile.getAvatarUrl());
            } catch (Exception e) {
                log.warn("Failed to delete old avatar: {}", profile.getAvatarUrl(), e);
            }
        }
        
        // Upload new avatar
        FileUploadResponse uploadResponse = storageService.uploadProfileAvatar(userId, file);
        
        // Update profile
        if (profile == null) {
            profile = UserProfile.builder()
                    .user(user)
                    .build();
        }
        profile.setAvatarUrl(uploadResponse.getFileUrl());
        userProfileRepository.save(profile);
        
        log.info("Avatar uploaded for user: {}", userId);
        return uploadResponse.getFileUrl();
    }
    
    // Creator Profile Methods
    
    /**
     * Get creator profile
     */
    @Transactional(readOnly = true)
    public CreatorProfileDTO getCreatorProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        if (user.getRole() != UserRole.CREATOR) {
            throw new BusinessException("User is not a creator");
        }
        
        CreatorProfile profile = user.getCreatorProfile();
        if (profile == null) {
            throw new ResourceNotFoundException("Creator Profile", userId);
        }
        
        return toCreatorProfileDTO(profile);
    }
    
    /**
     * Update creator profile
     */
    @Transactional
    public CreatorProfileDTO updateCreatorProfile(String userId, String username, String category,
                                                  String instagramUrl, String youtubeUrl, String twitterUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        if (user.getRole() != UserRole.CREATOR) {
            throw new BusinessException("User is not a creator");
        }
        
        CreatorProfile profile = user.getCreatorProfile();
        if (profile == null) {
            throw new ResourceNotFoundException("Creator Profile", userId);
        }
        
        // Validate username uniqueness if changed
        if (username != null && !username.equals(profile.getUsername())) {
            ProfileValidationUtil.validateUsername(username);
            if (creatorProfileRepository.existsByUsernameAndUserIdNot(username, userId)) {
                throw new BusinessException("Username already taken");
            }
            profile.setUsername(username);
        }
        
        if (category != null) {
            profile.setCategory(category);
        }
        
        // Validate and set social links
        if (instagramUrl != null) {
            ProfileValidationUtil.validateInstagramUrl(instagramUrl);
            profile.setInstagramUrl(instagramUrl);
        }
        if (youtubeUrl != null) {
            ProfileValidationUtil.validateYouTubeUrl(youtubeUrl);
            profile.setYoutubeUrl(youtubeUrl);
        }
        if (twitterUrl != null) {
            ProfileValidationUtil.validateTwitterUrl(twitterUrl);
            profile.setTwitterUrl(twitterUrl);
        }
        
        profile = creatorProfileRepository.save(profile);
        
        log.info("Creator profile updated: {}", userId);
        return toCreatorProfileDTO(profile);
    }
    
    /**
     * Get portfolio items
     */
    @Transactional(readOnly = true)
    public List<PortfolioItem> getPortfolio(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        if (user.getRole() != UserRole.CREATOR) {
            throw new BusinessException("User is not a creator");
        }
        
        CreatorProfile profile = user.getCreatorProfile();
        if (profile == null) {
            return new ArrayList<>();
        }
        
        return convertPortfolioItems(profile.getPortfolioItems());
    }
    
    /**
     * Add portfolio item
     */
    @Transactional
    public PortfolioItem addPortfolioItem(String userId, String title, String description, MultipartFile media) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        if (user.getRole() != UserRole.CREATOR) {
            throw new BusinessException("User is not a creator");
        }
        
        CreatorProfile profile = user.getCreatorProfile();
        if (profile == null) {
            throw new ResourceNotFoundException("Creator Profile", userId);
        }
        
        // Upload media file
        FileUploadResponse uploadResponse = storageService.uploadPortfolioItem(userId, media);
        
        // Determine media type
        String mediaType = uploadResponse.getFileType().startsWith("image/") ? "IMAGE" : "VIDEO";
        
        // Create portfolio item
        PortfolioItem item = PortfolioItem.builder()
                .id(UUID.randomUUID().toString())
                .title(title)
                .description(description)
                .mediaUrl(uploadResponse.getFileUrl())
                .mediaType(mediaType)
                .createdAt(LocalDateTime.now())
                .build();
        
        // Add to portfolio items list
        List<Object> portfolioItems = new ArrayList<>(profile.getPortfolioItems());
        portfolioItems.add(convertToObject(item));
        profile.setPortfolioItems(portfolioItems);
        
        profile = creatorProfileRepository.save(profile);
        
        log.info("Portfolio item added for user: {}", userId);
        return item;
    }
    
    /**
     * Delete portfolio item
     */
    @Transactional
    public void deletePortfolioItem(String userId, String itemId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        if (user.getRole() != UserRole.CREATOR) {
            throw new BusinessException("User is not a creator");
        }
        
        CreatorProfile profile = user.getCreatorProfile();
        if (profile == null) {
            throw new ResourceNotFoundException("Creator Profile", userId);
        }
        
        // Find and remove item
        List<Object> portfolioItems = new ArrayList<>(profile.getPortfolioItems());
        List<PortfolioItem> items = convertPortfolioItems(portfolioItems);
        
        PortfolioItem itemToDelete = items.stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio Item", itemId));
        
        // Delete file from storage
        try {
            storageService.deleteFile(itemToDelete.getMediaUrl());
        } catch (Exception e) {
            log.warn("Failed to delete portfolio item file: {}", itemToDelete.getMediaUrl(), e);
        }
        
        // Remove from list
        portfolioItems.removeIf(item -> {
            PortfolioItem pItem = convertToPortfolioItem(item);
            return pItem != null && pItem.getId().equals(itemId);
        });
        
        profile.setPortfolioItems(portfolioItems);
        creatorProfileRepository.save(profile);
        
        log.info("Portfolio item deleted: {} for user: {}", itemId, userId);
    }
    
    // Brand Profile Methods
    
    /**
     * Get brand profile
     */
    @Transactional(readOnly = true)
    public BrandProfileDTO getBrandProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        if (user.getRole() != UserRole.BRAND) {
            throw new BusinessException("User is not a brand");
        }
        
        BrandProfile profile = user.getBrandProfile();
        if (profile == null) {
            throw new ResourceNotFoundException("Brand Profile", userId);
        }
        
        return toBrandProfileDTO(profile);
    }
    
    /**
     * Update brand profile
     */
    @Transactional
    public BrandProfileDTO updateBrandProfile(String userId, String companyName, String gstNumber,
                                             String industry, String website, String companyDescription) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        if (user.getRole() != UserRole.BRAND) {
            throw new BusinessException("User is not a brand");
        }
        
        BrandProfile profile = user.getBrandProfile();
        if (profile == null) {
            throw new ResourceNotFoundException("Brand Profile", userId);
        }
        
        if (companyName != null) {
            profile.setCompanyName(companyName);
        }
        
        if (gstNumber != null) {
            ProfileValidationUtil.validateGSTNumber(gstNumber);
            profile.setGstNumber(gstNumber);
        }
        
        if (industry != null) {
            profile.setIndustry(industry);
        }
        
        if (website != null) {
            ProfileValidationUtil.validateWebsiteUrl(website);
            profile.setWebsite(website);
        }
        
        if (companyDescription != null) {
            profile.setCompanyDescription(companyDescription);
        }
        
        profile = brandProfileRepository.save(profile);
        
        log.info("Brand profile updated: {}", userId);
        return toBrandProfileDTO(profile);
    }
    
    // Helper methods
    
    private UserProfileDTO toUserProfileDTO(User user, UserProfile profile) {
        return UserProfileDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(profile.getFullName())
                .phone(user.getPhone())
                .avatarUrl(profile.getAvatarUrl())
                .bio(profile.getBio())
                .createdAt(profile.getCreatedAt())
                .build();
    }
    
    private CreatorProfileDTO toCreatorProfileDTO(CreatorProfile profile) {
        return CreatorProfileDTO.builder()
                .userId(profile.getUserId())
                .username(profile.getUsername())
                .category(profile.getCategory())
                .followerCount(profile.getFollowerCount())
                .engagementRate(profile.getEngagementRate())
                .instagramUrl(profile.getInstagramUrl())
                .youtubeUrl(profile.getYoutubeUrl())
                .twitterUrl(profile.getTwitterUrl())
                .tiktokUrl(profile.getTiktokUrl())
                .portfolio(convertPortfolioItems(profile.getPortfolioItems()))
                .verified(profile.getVerified())
                .build();
    }
    
    private BrandProfileDTO toBrandProfileDTO(BrandProfile profile) {
        return BrandProfileDTO.builder()
                .userId(profile.getUserId())
                .companyName(profile.getCompanyName())
                .gstNumber(profile.getGstNumber())
                .industry(profile.getIndustry())
                .website(profile.getWebsite())
                .verified(profile.getVerified())
                .companyLogoUrl(profile.getCompanyLogoUrl())
                .companyDescription(profile.getCompanyDescription())
                .build();
    }
    
    private List<PortfolioItem> convertPortfolioItems(List<Object> items) {
        if (items == null || items.isEmpty()) {
            return new ArrayList<>();
        }
        
        return items.stream()
                .map(this::convertToPortfolioItem)
                .filter(item -> item != null)
                .collect(Collectors.toList());
    }
    
    @SuppressWarnings("unchecked")
    private PortfolioItem convertToPortfolioItem(Object item) {
        try {
            if (item instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) item;
                PortfolioItem.PortfolioItemBuilder builder = PortfolioItem.builder();
                
                if (map.get("id") != null) {
                    builder.id(map.get("id").toString());
                }
                if (map.get("title") != null) {
                    builder.title(map.get("title").toString());
                }
                if (map.get("description") != null) {
                    builder.description(map.get("description").toString());
                }
                if (map.get("mediaUrl") != null) {
                    builder.mediaUrl(map.get("mediaUrl").toString());
                }
                if (map.get("mediaType") != null) {
                    builder.mediaType(map.get("mediaType").toString());
                }
                if (map.get("createdAt") != null) {
                    try {
                        builder.createdAt(LocalDateTime.parse(map.get("createdAt").toString()));
                    } catch (Exception e) {
                        log.warn("Failed to parse createdAt: {}", map.get("createdAt"), e);
                    }
                }
                
                return builder.build();
            }
            return objectMapper.convertValue(item, PortfolioItem.class);
        } catch (Exception e) {
            log.warn("Failed to convert portfolio item: {}", item, e);
            return null;
        }
    }
    
    private Object convertToObject(PortfolioItem item) {
        try {
            // Convert PortfolioItem to Map for JSONB storage
            Map<String, Object> map = new HashMap<>();
            map.put("id", item.getId());
            map.put("title", item.getTitle());
            map.put("description", item.getDescription());
            map.put("mediaUrl", item.getMediaUrl());
            map.put("mediaType", item.getMediaType());
            map.put("createdAt", item.getCreatedAt() != null ? item.getCreatedAt().toString() : null);
            return map;
        } catch (Exception e) {
            log.error("Failed to convert portfolio item to object: {}", item, e);
            throw new BusinessException("Failed to save portfolio item");
        }
    }
}

