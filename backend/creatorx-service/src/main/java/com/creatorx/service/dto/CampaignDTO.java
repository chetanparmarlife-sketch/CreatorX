package com.creatorx.service.dto;

import com.creatorx.common.enums.CampaignPlatform;
import com.creatorx.common.enums.CampaignStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignDTO {
    private String id;
    private String title;
    private String description;
    private BigDecimal budget;
    private CampaignPlatform platform;
    private String category;
    private String requirements;
    private List<String> deliverableTypes;
    private CampaignStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate applicationDeadline;
    private Integer maxApplicants;
    private Integer selectedCreatorsCount;
    private List<String> tags;
    private List<String> requirementTexts;
    private String reviewReason;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Brand information
    private BrandInfo brand;
    
    // Deliverables
    private List<CampaignDeliverableDTO> deliverables;
    
    // Application count (for creators)
    private Long applicationCount;
    
    // Is saved by current user (for creators)
    private Boolean isSaved;

    // Escrow / funding status
    private BigDecimal escrowAllocated;
    private BigDecimal escrowReleased;
    private String escrowStatus;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BrandInfo {
        private String id;
        private String name;
        private String email;
        private String logoUrl;
        private Boolean verified;
    }
}
