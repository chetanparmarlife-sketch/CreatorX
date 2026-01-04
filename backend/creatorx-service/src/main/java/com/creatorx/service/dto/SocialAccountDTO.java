package com.creatorx.service.dto;

import com.creatorx.common.enums.SocialProvider;
import com.creatorx.common.enums.SocialSyncStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SocialAccountDTO {
    private SocialProvider provider;
    private boolean connected;
    private String status;
    private String username;
    private String profileUrl;
    private Integer followerCount;
    private Double engagementRate;
    private Integer avgViews;
    private String lastSyncedAt;
    private SocialSyncStatus syncStatus;
    private String errorMessage;
}
