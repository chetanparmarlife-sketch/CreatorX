package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO for MediaKit entity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaKitDTO {

    private String id;
    private String userId;

    // Basic Info
    private String displayName;
    private String bio;
    private String tagline;
    private String profileImageUrl;

    // Categories
    private String primaryCategory;
    private List<String> categories;

    // Pricing Rates
    private BigDecimal reelRate;
    private BigDecimal storyRate;
    private BigDecimal postRate;
    private BigDecimal youtubeRate;
    private BigDecimal shortRate;
    private BigDecimal liveRate;
    private Map<String, BigDecimal> customRates;

    // Social Stats
    private Integer totalFollowers;
    private BigDecimal avgEngagementRate;
    private Map<String, Object> socialStats;

    // Portfolio
    private List<String> portfolioUrls;

    // Contact
    private String contactEmail;
    private String city;
    private String country;

    // Visibility
    private Boolean isPublic;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
