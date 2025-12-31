package com.creatorx.service.dto;

import com.creatorx.common.enums.ComplianceReportStatus;
import com.creatorx.common.enums.ComplianceReportType;
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
public class ComplianceReportDTO {
    private String id;
    private ComplianceReportType reportType;
    private ComplianceReportStatus status;
    private String region;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private String fileUrl;
    private String signedUrl;
    private Map<String, Object> details;
    private String generatedBy;
    private LocalDateTime generatedAt;
    private LocalDateTime createdAt;
}
