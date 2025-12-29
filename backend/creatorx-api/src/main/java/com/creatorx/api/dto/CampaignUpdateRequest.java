package com.creatorx.api.dto;

import com.creatorx.common.enums.CampaignStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CampaignUpdateRequest {
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;
    
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;
    
    @DecimalMin(value = "0.01", message = "Budget must be positive")
    private BigDecimal budget;
    
    private String category;
    
    @Size(max = 5000, message = "Requirements must not exceed 5000 characters")
    private String requirements;
    
    private List<String> deliverableTypes;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private LocalDate applicationDeadline;
    
    @Min(value = 1, message = "Max applicants must be at least 1")
    private Integer maxApplicants;
    
    private CampaignStatus status;
    
    private List<String> tags;
    
    private List<@Valid CampaignDeliverableCreateRequest> deliverables;
    
    @AssertTrue(message = "End date must be after start date")
    private boolean isValidDateRange() {
        if (startDate == null || endDate == null) {
            return true;
        }
        return !endDate.isBefore(startDate);
    }
}

