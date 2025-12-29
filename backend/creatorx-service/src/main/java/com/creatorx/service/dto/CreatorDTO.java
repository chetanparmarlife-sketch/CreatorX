package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for creator profile information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorDTO {
    private String id;
    private String email;
    private String username;
    private String category;
    private Integer followerCount;
    private BigDecimal engagementRate;
    private String instagramUrl;
    private String youtubeUrl;
    private String tiktokUrl;
    private String twitterUrl;
    private Boolean verified;
    private String avatarUrl;
    private String bio;
    private String location;
    
    // Portfolio items count
    private Integer portfolioItemsCount;
    
    // Social media platforms
    private List<String> platforms;
    
    // Stats
    private CreatorStats stats;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatorStats {
        private Long totalApplications;
        private Long selectedApplications;
        private Double acceptanceRate;
        private Long completedCampaigns;
    }
}

