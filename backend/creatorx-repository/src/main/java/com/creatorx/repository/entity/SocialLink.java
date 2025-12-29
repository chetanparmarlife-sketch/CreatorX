package com.creatorx.repository.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "social_links")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialLink extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String platform;
    
    private String icon;
    
    @Column(nullable = false)
    private String url;
    
    private String followers;
}




