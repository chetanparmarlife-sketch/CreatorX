package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Portfolio Item DTO
 * Represents a portfolio item stored in JSONB format
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioItem {
    private String id;
    private String title;
    private String description;
    private String mediaUrl;
    private String mediaType; // IMAGE, VIDEO
    private LocalDateTime createdAt;
}

