package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorProfileDTO {
    private String userId;
    private String username;
    private String category;
    private Integer followerCount;
    private BigDecimal engagementRate;
    private String instagramUrl;
    private String youtubeUrl;
    private String twitterUrl;
    private String tiktokUrl;
    private List<PortfolioItem> portfolio;
    private Boolean verified;
}

