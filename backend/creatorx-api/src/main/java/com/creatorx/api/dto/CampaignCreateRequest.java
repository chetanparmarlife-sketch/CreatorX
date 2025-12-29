package com.creatorx.api.dto;

import com.creatorx.common.enums.CampaignPlatform;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CampaignCreateRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;
    
    @NotBlank(message = "Description is required")
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;
    
    @NotNull(message = "Budget is required")
    @DecimalMin(value = "0.01", message = "Budget must be positive")
    private BigDecimal budget;
    
    @NotNull(message = "Platform is required")
    private CampaignPlatform platform;
    
    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;
    
    @Size(max = 5000, message = "Requirements must not exceed 5000 characters")
    private String requirements;
    
    @NotEmpty(message = "At least one deliverable type is required")
    private List<String> deliverableTypes;
    
    @NotNull(message = "Start date is required")
    @Future(message = "Start date must be in the future")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    
    private LocalDate applicationDeadline;
    
    @Min(value = 1, message = "Max applicants must be at least 1")
    private Integer maxApplicants;
    
    private List<String> tags;
    
    private List<@Valid CampaignDeliverableCreateRequest> deliverables;
    
    @AssertTrue(message = "End date must be after start date")
    private boolean isValidDateRange() {
        if (startDate == null || endDate == null) {
            return true; // Let @NotNull handle null validation
        }
        return !endDate.isBefore(startDate);
    }
    
    @AssertTrue(message = "Application deadline must be before or equal to end date")
    private boolean isValidApplicationDeadline() {
        if (applicationDeadline == null || endDate == null) {
            return true;
        }
        return !applicationDeadline.isAfter(endDate);
    }
}

