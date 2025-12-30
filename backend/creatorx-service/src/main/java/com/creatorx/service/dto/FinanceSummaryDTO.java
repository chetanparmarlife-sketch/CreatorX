package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinanceSummaryDTO {
    private BigDecimal totalEarnings;
    private BigDecimal totalWithdrawals;
    private BigDecimal totalRefunds;
    private BigDecimal totalPenalties;
    private BigDecimal pendingPayouts;
    private long totalTransactions;
}
