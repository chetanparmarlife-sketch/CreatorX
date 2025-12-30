package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisputeEvidenceDTO {
    private String id;
    private String fileUrl;
    private String fileType;
    private String notes;
    private String submittedBy;
    private LocalDateTime submittedAt;
}
