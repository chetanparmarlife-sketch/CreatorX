package com.creatorx.service.admin;

import com.creatorx.common.enums.TransactionStatus;
import com.creatorx.common.enums.TransactionType;
import com.creatorx.repository.TransactionRepository;
import com.creatorx.service.dto.FinanceSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminFinanceService {
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public FinanceSummaryDTO getSummary(LocalDateTime from, LocalDateTime to) {
        boolean useRange = from != null && to != null;

        BigDecimal totalEarnings = sum(TransactionType.EARNING, TransactionStatus.COMPLETED, from, to, useRange);
        BigDecimal totalWithdrawals = sum(TransactionType.WITHDRAWAL, TransactionStatus.COMPLETED, from, to, useRange);
        BigDecimal totalRefunds = sum(TransactionType.REFUND, TransactionStatus.COMPLETED, from, to, useRange);
        BigDecimal totalPenalties = sum(TransactionType.PENALTY, TransactionStatus.COMPLETED, from, to, useRange);
        BigDecimal pendingPayouts = sum(TransactionType.WITHDRAWAL, TransactionStatus.PENDING, from, to, useRange);

        long totalTransactions = transactionRepository.count();

        return FinanceSummaryDTO.builder()
                .totalEarnings(totalEarnings)
                .totalWithdrawals(totalWithdrawals)
                .totalRefunds(totalRefunds)
                .totalPenalties(totalPenalties)
                .pendingPayouts(pendingPayouts)
                .totalTransactions(totalTransactions)
                .build();
    }

    private BigDecimal sum(TransactionType type, TransactionStatus status, LocalDateTime from, LocalDateTime to, boolean useRange) {
        if (useRange) {
            return transactionRepository.sumByTypeAndStatusAndDateRange(type, status, from, to);
        }
        return transactionRepository.sumByTypeAndStatus(type, status);
    }
}
