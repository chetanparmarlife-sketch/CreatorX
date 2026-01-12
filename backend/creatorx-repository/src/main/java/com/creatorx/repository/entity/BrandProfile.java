package com.creatorx.repository.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.Builder;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "brand_profiles", indexes = {
    @Index(name = "idx_brand_profiles_company_name", columnList = "company_name"),
    @Index(name = "idx_brand_profiles_gst", columnList = "gst_number"),
    @Index(name = "idx_brand_profiles_verified", columnList = "verified")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "user")
public class BrandProfile {
    @Id
    @Column(name = "user_id")
    private String userId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @MapsId
    private User user;
    
    @Column(name = "company_name", nullable = false)
    private String companyName;
    
    @Column(name = "gst_number", unique = true, length = 15)
    private String gstNumber;
    
    @Column(length = 100)
    private String industry;
    
    private String website;
    
    @Builder.Default
    private Boolean verified = false;
    
    @Column(name = "company_logo_url", columnDefinition = "TEXT")
    private String companyLogoUrl;
    
    @Column(name = "company_description", columnDefinition = "TEXT")
    private String companyDescription;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

