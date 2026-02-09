package com.creatorx.repository.entity;
import com.creatorx.repository.converter.UuidToStringConverter;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
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
import java.util.Map;

/**
 * MediaKit entity - stores creator's public media kit information
 * including bio, categories, pricing rates, and social stats
 */
@Entity
@Table(name = "media_kits", indexes = {
        @Index(name = "idx_media_kits_user_id", columnList = "user_id"),
        @Index(name = "idx_media_kits_is_public", columnList = "is_public")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "user")
public class MediaKit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "user_id", columnDefinition = "uuid", insertable = false, updatable = false)
    @Convert(converter = UuidToStringConverter.class)
    private String userId;

    // Basic Info
    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(length = 1000)
    private String bio;

    @Column(length = 255)
    private String tagline;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    // Categories & Niches
    @Column(name = "primary_category", length = 100)
    private String primaryCategory;

    @Column(name = "categories", columnDefinition = "JSONB")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private List<String> categories = new java.util.ArrayList<>();

    // Pricing Rates (in INR)
    @Column(name = "reel_rate", precision = 10, scale = 2)
    private BigDecimal reelRate;

    @Column(name = "story_rate", precision = 10, scale = 2)
    private BigDecimal storyRate;

    @Column(name = "post_rate", precision = 10, scale = 2)
    private BigDecimal postRate;

    @Column(name = "youtube_rate", precision = 10, scale = 2)
    private BigDecimal youtubeRate;

    @Column(name = "short_rate", precision = 10, scale = 2)
    private BigDecimal shortRate;

    @Column(name = "live_rate", precision = 10, scale = 2)
    private BigDecimal liveRate;

    @Column(name = "custom_rates", columnDefinition = "JSONB")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private Map<String, BigDecimal> customRates = new java.util.HashMap<>();

    // Social Stats (cached from social accounts)
    @Column(name = "total_followers")
    @Builder.Default
    private Integer totalFollowers = 0;

    @Column(name = "avg_engagement_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal avgEngagementRate = BigDecimal.ZERO;

    @Column(name = "social_stats", columnDefinition = "JSONB")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private Map<String, Object> socialStats = new java.util.HashMap<>();

    // Portfolio
    @Column(name = "portfolio_urls", columnDefinition = "JSONB")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private List<String> portfolioUrls = new java.util.ArrayList<>();

    // Contact & Location
    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String country;

    // Visibility
    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = true;

    // Timestamps
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
