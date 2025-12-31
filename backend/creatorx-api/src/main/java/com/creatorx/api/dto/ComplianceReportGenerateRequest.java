package com.creatorx.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceReportGenerateRequest {
    private String region;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
}
