package com.creatorx.repository.projection;

import java.math.BigDecimal;

public interface FinanceCampaignAggregate {
    String getCampaignId();
    String getCampaignTitle();
    Long getTransactionCount();
    BigDecimal getTotalAmount();
}
