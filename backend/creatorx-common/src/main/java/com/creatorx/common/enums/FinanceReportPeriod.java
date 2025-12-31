package com.creatorx.common.enums;

public enum FinanceReportPeriod {
    DAY("day"),
    WEEK("week"),
    MONTH("month");

    private final String postgresValue;

    FinanceReportPeriod(String postgresValue) {
        this.postgresValue = postgresValue;
    }

    public String getPostgresValue() {
        return postgresValue;
    }
}
