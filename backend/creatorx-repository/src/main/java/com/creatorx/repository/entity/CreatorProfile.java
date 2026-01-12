package com.creatorx.repository.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.Builder;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "creator_profiles", indexes = {
    @Index(name = "idx_creator_profiles_username", columnList = "username"),
    @Index(name = "idx_creator_profiles_category", columnList = "category"),
    @Index(name = "idx_creator_profiles_verified", columnList = "verified")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "user")
public class CreatorProfile {
    @Id
    @Column(name = "user_id")
    private String userId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @MapsId
    private User user;
    
    @Column(nullable = false, unique = true, length = 100)
    private String username;
    
    @Column(nullable = false, length = 100)
    private String category;
    
    @Column(name = "follower_count")
    @Builder.Default
    private Integer followerCount = 0;
    
    @Column(name = "engagement_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal engagementRate = BigDecimal.ZERO;
    
    @Column(name = "instagram_url", length = 255)
    private String instagramUrl;
    
    @Column(name = "youtube_url", length = 255)
    private String youtubeUrl;
    
    @Column(name = "tiktok_url", length = 255)
    private String tiktokUrl;
    
    @Column(name = "twitter_url", length = 255)
    private String twitterUrl;
    
    @Column(name = "portfolio_items", columnDefinition = "JSONB")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private List<Object> portfolioItems = new java.util.ArrayList<>();
    
    @Builder.Default
    private Boolean verified = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

