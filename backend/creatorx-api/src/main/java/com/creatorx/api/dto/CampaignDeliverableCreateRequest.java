package com.creatorx.api.dto;

import com.creatorx.repository.entity.CampaignDeliverable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CampaignDeliverableCreateRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;
    
    @NotNull(message = "Type is required")
    private CampaignDeliverable.DeliverableType type;
    
    @NotNull(message = "Due date is required")
    private LocalDate dueDate;
    
    private Boolean isMandatory = true;
    
    private Integer orderIndex = 0;
}

