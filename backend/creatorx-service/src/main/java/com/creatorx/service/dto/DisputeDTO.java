package com.creatorx.service.dto;

import com.creatorx.common.enums.DisputeStatus;
import com.creatorx.common.enums.DisputeType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisputeDTO {
    private String id;
    private String campaignId;
    private String campaignTitle;
    private String creatorId;
    private String creatorEmail;
    private String brandId;
    private String brandEmail;
    private DisputeType type;
    private DisputeStatus status;
    private String description;
    private String resolution;
    private String resolvedBy;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private List<DisputeEvidenceDTO> evidence;
}
