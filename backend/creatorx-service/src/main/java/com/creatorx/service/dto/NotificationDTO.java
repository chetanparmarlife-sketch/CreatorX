package com.creatorx.service.dto;

import com.creatorx.common.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private String id;
    private NotificationType type;
    private String title;
    private String body;
    private Map<String, Object> data; // navigation data
    private Boolean read;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}

