package com.creatorx.repository.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "fcm_tokens", indexes = {
    @Index(name = "idx_fcm_tokens_user_id", columnList = "user_id"),
    @Index(name = "idx_fcm_tokens_device_id", columnList = "device_id"),
    @Index(name = "idx_fcm_tokens_user_device", columnList = "user_id,device_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "user")
public class FCMToken extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "fcm_token", nullable = false, columnDefinition = "TEXT")
    private String fcmToken;
    
    @Column(name = "device_id", nullable = false, length = 255)
    private String deviceId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Platform platform; // IOS, ANDROID
    
    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;
    
    @Builder.Default
    private Boolean active = true;
    
    public enum Platform {
        IOS,
        ANDROID
    }
}

