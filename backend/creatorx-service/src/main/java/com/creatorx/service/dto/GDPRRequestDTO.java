package com.creatorx.service.dto;

import com.creatorx.common.enums.GDPRRequestStatus;
import com.creatorx.common.enums.GDPRRequestType;
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
public class GDPRRequestDTO {
    private String id;
    private String userId;
    private String userEmail;
    private GDPRRequestType requestType;
    private GDPRRequestStatus status;
    private Map<String, Object> details;
    private String exportUrl;
    private String resolvedBy;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
