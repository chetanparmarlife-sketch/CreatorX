package com.creatorx.service.dto;

import com.creatorx.common.enums.AppealStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountAppealDTO {
    private String id;
    private String userId;
    private String userEmail;
    private AppealStatus status;
    private String reason;
    private String resolution;
    private String resolvedBy;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
