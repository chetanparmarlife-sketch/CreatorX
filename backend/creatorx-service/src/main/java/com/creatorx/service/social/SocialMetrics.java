package com.creatorx.service.social;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SocialMetrics {
    private String username;
    private String profileUrl;
    private Integer followerCount;
    private Double engagementRate;
    private Integer avgViews;
}
