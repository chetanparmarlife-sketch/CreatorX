package com.creatorx.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WithdrawalRequestDTO {
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "100.00", message = "Minimum withdrawal amount is ₹100")
    private BigDecimal amount;
    
    @NotNull(message = "Bank account ID is required")
    private String bankAccountId;
}

