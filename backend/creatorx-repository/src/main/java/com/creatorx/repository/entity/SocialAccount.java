package com.creatorx.repository.entity;

import com.creatorx.common.enums.SocialProvider;
import com.creatorx.common.enums.SocialSyncStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "social_accounts")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class SocialAccount extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SocialProvider provider;

    private String username;

    @Column(name = "profile_url")
    private String profileUrl;

    @Column(name = "follower_count")
    private Integer followerCount;

    @Column(name = "engagement_rate")
    private Double engagementRate;

    @Column(name = "avg_views")
    private Integer avgViews;

    @Column(name = "access_token_encrypted")
    private String accessTokenEncrypted;

    @Column(name = "refresh_token_encrypted")
    private String refreshTokenEncrypted;

    @Column(name = "token_expires_at")
    private LocalDateTime tokenExpiresAt;

    private boolean connected;

    @Enumerated(EnumType.STRING)
    @Column(name = "sync_status", nullable = false)
    private SocialSyncStatus syncStatus;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    @Column(name = "last_manual_refresh_at")
    private LocalDateTime lastManualRefreshAt;

    @Column(name = "last_failure_at")
    private LocalDateTime lastFailureAt;

    @Column(name = "last_failure_message")
    private String lastFailureMessage;

    @Column(name = "failure_count")
    private Integer failureCount;
}
