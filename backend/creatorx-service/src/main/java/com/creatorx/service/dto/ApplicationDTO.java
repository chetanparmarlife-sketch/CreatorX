package com.creatorx.service.dto;

import com.creatorx.common.enums.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDTO {
    private String id;
    private CampaignDTO campaign;
    private CreatorInfo creator;
    private ApplicationStatus status;
    private String pitchText;
    private String expectedTimeline;
    private String rejectionReason;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatorInfo {
        private String id;
        private String name;
        private String email;
        private String avatarUrl;
        private String username;
        private Boolean verified;
    }
}

