package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * BrandListResponse.
 *
 * Response sent to the brand dashboard for a saved creator list. It includes
 * creator IDs so the dashboard can render and compare shared shortlists.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandListResponse {
    private String id;
    private String brandId;
    private String campaignId;
    private String name;
    private List<String> creatorIds;
    private int creatorCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
