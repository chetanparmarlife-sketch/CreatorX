package com.creatorx.service.dto;

import com.creatorx.common.enums.TransactionStatus;
import com.creatorx.common.enums.TransactionType;
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
public class TransactionDTO {
    private String id;
    private TransactionType type; // EARNING, WITHDRAWAL, REFUND, FEE
    private BigDecimal amount;
    private TransactionStatus status; // PENDING, COMPLETED, FAILED
    private String description;
    private CampaignDTO campaign; // if related to campaign
    private String campaignId; // for easier access
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

