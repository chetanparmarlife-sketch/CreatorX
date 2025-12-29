package com.creatorx.api.dto;

import com.creatorx.repository.entity.FCMToken;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FCMTokenRequest {
    @NotBlank(message = "FCM token is required")
    private String token;
    
    @NotBlank(message = "Device ID is required")
    private String deviceId;
    
    @NotNull(message = "Platform is required")
    private FCMToken.Platform platform; // IOS, ANDROID
}

