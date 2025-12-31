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
public class BrandVerificationHistoryDTO {
    private String documentId;
    private String status;
    private String rejectionReason;
    private String fileUrl;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
}
