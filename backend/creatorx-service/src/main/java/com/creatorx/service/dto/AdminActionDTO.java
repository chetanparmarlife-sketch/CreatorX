package com.creatorx.service.dto;

import com.creatorx.common.enums.AdminActionType;
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
public class AdminActionDTO {
    private String id;
    private String adminId;
    private String adminEmail;
    private AdminActionType actionType;
    private String entityType;
    private String entityId;
    private Map<String, Object> details;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime createdAt;
}
