package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for Invoice responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDTO {
    private String id;
    private String invoiceNumber;
    private String campaignName;
    private String brandName;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String issueDate;
    private String dueDate;
    private String paidDate;
    private String description;
}
