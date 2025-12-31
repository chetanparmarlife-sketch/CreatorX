package com.creatorx.repository.projection;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface FinancePeriodAggregate {
    LocalDateTime getPeriodStart();
    Long getTransactionCount();
    BigDecimal getTotalAmount();
}
