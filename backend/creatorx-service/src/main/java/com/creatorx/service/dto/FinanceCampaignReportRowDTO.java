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
public class FinanceCampaignReportRowDTO {
    private String campaignId;
    private String campaignTitle;
    private Long transactionCount;
    private BigDecimal totalAmount;
}
