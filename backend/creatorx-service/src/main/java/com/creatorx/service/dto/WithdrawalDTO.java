package com.creatorx.service.dto;

import com.creatorx.common.enums.WithdrawalStatus;
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
public class WithdrawalDTO {
    private String id;
    private BigDecimal amount;
    private BankAccountDTO bankAccount;
    private WithdrawalStatus status;
    private String failureReason;
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
}

