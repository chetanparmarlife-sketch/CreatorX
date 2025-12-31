package com.creatorx.service.dto;

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
public class BrandVerificationDetailDTO {
    private String documentId;
    private String brandId;
    private String brandEmail;
    private String status;
    private String fileUrl;
    private String rejectionReason;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private BrandProfileSummaryDTO profile;
    private BrandVerificationRiskDTO risk;
    private List<BrandVerificationHistoryDTO> history;
}
