package com.creatorx.repository.projection;

import java.math.BigDecimal;

public interface FinanceUserAggregate {
    String getUserId();
    String getUserEmail();
    Long getTransactionCount();
    BigDecimal getTotalAmount();
}
