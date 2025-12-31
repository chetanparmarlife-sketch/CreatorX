package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancePeriodReportRowDTO {
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private Long transactionCount;
    private BigDecimal totalAmount;
}
