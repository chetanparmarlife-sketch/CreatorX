package com.creatorx.service.admin;

import com.creatorx.common.enums.FinanceReportPeriod;
import com.creatorx.common.enums.TransactionStatus;
import com.creatorx.common.enums.TransactionType;
import com.creatorx.repository.TransactionRepository;
import com.creatorx.repository.projection.FinanceCampaignAggregate;
import com.creatorx.repository.projection.FinancePeriodAggregate;
import com.creatorx.repository.projection.FinanceUserAggregate;
import com.creatorx.service.dto.FinanceCampaignReportRowDTO;
import com.creatorx.service.dto.FinancePeriodReportRowDTO;
import com.creatorx.service.dto.FinanceSummaryDTO;
import com.creatorx.service.dto.FinanceUserReportRowDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

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

    @Transactional(readOnly = true)
    public List<FinanceUserReportRowDTO> getUserReport(TransactionType type, TransactionStatus status, LocalDateTime from, LocalDateTime to) {
        List<FinanceUserAggregate> aggregates = transactionRepository.aggregateByUser(type, status, from, to);
        return aggregates.stream()
                .map(aggregate -> FinanceUserReportRowDTO.builder()
                        .userId(aggregate.getUserId())
                        .userEmail(aggregate.getUserEmail())
                        .transactionCount(aggregate.getTransactionCount())
                        .totalAmount(aggregate.getTotalAmount())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FinanceCampaignReportRowDTO> getCampaignReport(TransactionType type, TransactionStatus status, LocalDateTime from, LocalDateTime to) {
        List<FinanceCampaignAggregate> aggregates = transactionRepository.aggregateByCampaign(type, status, from, to);
        return aggregates.stream()
                .map(aggregate -> FinanceCampaignReportRowDTO.builder()
                        .campaignId(aggregate.getCampaignId())
                        .campaignTitle(aggregate.getCampaignTitle())
                        .transactionCount(aggregate.getTransactionCount())
                        .totalAmount(aggregate.getTotalAmount())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FinancePeriodReportRowDTO> getPeriodReport(
            FinanceReportPeriod period,
            TransactionType type,
            TransactionStatus status,
            LocalDateTime from,
            LocalDateTime to
    ) {
        FinanceReportPeriod effectivePeriod = period != null ? period : FinanceReportPeriod.DAY;
        String typeValue = type != null ? type.name() : null;
        String statusValue = status != null ? status.name() : null;
        List<FinancePeriodAggregate> aggregates = transactionRepository.aggregateByPeriod(
                effectivePeriod.getPostgresValue(),
                typeValue,
                statusValue,
                from,
                to
        );
        return aggregates.stream()
                .map(aggregate -> FinancePeriodReportRowDTO.builder()
                        .periodStart(aggregate.getPeriodStart())
                        .periodEnd(calculatePeriodEnd(aggregate.getPeriodStart(), effectivePeriod))
                        .transactionCount(aggregate.getTransactionCount())
                        .totalAmount(aggregate.getTotalAmount())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public String exportUserReportCsv(TransactionType type, TransactionStatus status, LocalDateTime from, LocalDateTime to, boolean includeFlags) {
        List<FinanceUserReportRowDTO> rows = getUserReport(type, status, from, to);
        String header = includeFlags
                ? "userId,userEmail,transactionCount,totalAmount,reconciliationFlag"
                : "userId,userEmail,transactionCount,totalAmount";
        return rows.stream()
                .map(row -> joinCsv(
                        includeFlags,
                        csvEscape(row.getUserId()),
                        csvEscape(row.getUserEmail()),
                        csvEscape(valueOrEmpty(row.getTransactionCount())),
                        csvEscape(valueOrEmpty(row.getTotalAmount())),
                        csvEscape(reconciliationFlag(status, row.getTotalAmount(), row.getTransactionCount()))
                ))
                .collect(Collectors.joining("\n", header + "\n", "\n"));
    }

    @Transactional(readOnly = true)
    public String exportCampaignReportCsv(TransactionType type, TransactionStatus status, LocalDateTime from, LocalDateTime to, boolean includeFlags) {
        List<FinanceCampaignReportRowDTO> rows = getCampaignReport(type, status, from, to);
        String header = includeFlags
                ? "campaignId,campaignTitle,transactionCount,totalAmount,reconciliationFlag"
                : "campaignId,campaignTitle,transactionCount,totalAmount";
        return rows.stream()
                .map(row -> joinCsv(
                        includeFlags,
                        csvEscape(row.getCampaignId()),
                        csvEscape(row.getCampaignTitle()),
                        csvEscape(valueOrEmpty(row.getTransactionCount())),
                        csvEscape(valueOrEmpty(row.getTotalAmount())),
                        csvEscape(reconciliationFlag(status, row.getTotalAmount(), row.getTransactionCount()))
                ))
                .collect(Collectors.joining("\n", header + "\n", "\n"));
    }

    @Transactional(readOnly = true)
    public String exportPeriodReportCsv(
            FinanceReportPeriod period,
            TransactionType type,
            TransactionStatus status,
            LocalDateTime from,
            LocalDateTime to,
            boolean includeFlags
    ) {
        List<FinancePeriodReportRowDTO> rows = getPeriodReport(period, type, status, from, to);
        String header = includeFlags
                ? "periodStart,periodEnd,transactionCount,totalAmount,reconciliationFlag"
                : "periodStart,periodEnd,transactionCount,totalAmount";
        return rows.stream()
                .map(row -> joinCsv(
                        includeFlags,
                        csvEscape(valueOrEmpty(row.getPeriodStart())),
                        csvEscape(valueOrEmpty(row.getPeriodEnd())),
                        csvEscape(valueOrEmpty(row.getTransactionCount())),
                        csvEscape(valueOrEmpty(row.getTotalAmount())),
                        csvEscape(reconciliationFlag(status, row.getTotalAmount(), row.getTransactionCount()))
                ))
                .collect(Collectors.joining("\n", header + "\n", "\n"));
    }

    private LocalDateTime calculatePeriodEnd(LocalDateTime start, FinanceReportPeriod period) {
        if (start == null) {
            return null;
        }
        return switch (period) {
            case WEEK -> start.plus(1, ChronoUnit.WEEKS).minusSeconds(1);
            case MONTH -> start.plus(1, ChronoUnit.MONTHS).minusSeconds(1);
            default -> start.plus(1, ChronoUnit.DAYS).minusSeconds(1);
        };
    }

    private String reconciliationFlag(TransactionStatus status, BigDecimal totalAmount, Long transactionCount) {
        if (status != null && status != TransactionStatus.COMPLETED) {
            return "REVIEW";
        }
        if (totalAmount != null && totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            return "NEGATIVE_TOTAL";
        }
        if (transactionCount != null && transactionCount == 0) {
            return "EMPTY";
        }
        return "OK";
    }

    private String valueOrEmpty(Object value) {
        return value != null ? value.toString() : "";
    }

    private String csvEscape(String value) {
        if (value == null) {
            return "";
        }
        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\n") || escaped.contains("\r")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    private String joinCsv(boolean includeFlags, String... values) {
        if (includeFlags) {
            return String.join(",", values);
        }
        if (values.length <= 1) {
            return values.length == 1 ? values[0] : "";
        }
        return String.join(",", java.util.Arrays.copyOf(values, values.length - 1));
    }

    private BigDecimal sum(TransactionType type, TransactionStatus status, LocalDateTime from, LocalDateTime to, boolean useRange) {
        if (useRange) {
            return transactionRepository.sumByTypeAndStatusAndDateRange(type, status, from, to);
        }
        return transactionRepository.sumByTypeAndStatus(type, status);
    }
}
