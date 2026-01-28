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
public class WalletDTO {
    private String userId;
    private BigDecimal balance; // = availableBalance + pendingBalance
    private BigDecimal availableBalance;
    private BigDecimal pendingBalance;
    private BigDecimal totalEarnings;
    private BigDecimal totalWithdrawn;
    private String currency; // INR
}
