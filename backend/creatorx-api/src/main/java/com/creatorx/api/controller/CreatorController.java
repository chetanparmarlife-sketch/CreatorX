package com.creatorx.api.controller;

import com.creatorx.repository.entity.User;
import com.creatorx.service.CreatorDiscoveryService;
import com.creatorx.service.dto.CreatorDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/creators")
@Tag(name = "Creators", description = "Creator discovery and search for brands")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class CreatorController {
    
    private final CreatorDiscoveryService creatorDiscoveryService;
    
    /**
     * Search creators with filters
     * Supports both repeated params and comma-separated strings for categories
     */
    @GetMapping
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Search creators", description = "Search and filter creators (Brand only)")
    public ResponseEntity<Page<CreatorDTO>> searchCreators(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false) String category, // Support comma-separated string
            @RequestParam(required = false) String platform,
            @RequestParam(required = false) Integer minFollowers,
            @RequestParam(required = false) Integer maxFollowers,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "follower_count") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDirection
    ) {
        // Normalize categories - support both repeated params and comma-separated
        List<String> normalizedCategories = categories;
        if (normalizedCategories == null || normalizedCategories.isEmpty()) {
            if (category != null && !category.trim().isEmpty()) {
                normalizedCategories = java.util.Arrays.asList(category.split(","))
                    .stream()
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(java.util.stream.Collectors.toList());
            }
        }
        
        // Normalize platform to enum values
        String normalizedPlatform = null;
        if (platform != null && !platform.trim().isEmpty()) {
            // Map display labels to enum values
            normalizedPlatform = switch (platform.toUpperCase()) {
                case "INSTAGRAM" -> "INSTAGRAM";
                case "YOUTUBE" -> "YOUTUBE";
                case "TIKTOK" -> "TIKTOK";
                case "TWITTER", "X" -> "TWITTER";
                case "FACEBOOK" -> "FACEBOOK";
                case "LINKEDIN" -> "LINKEDIN";
                default -> platform.toUpperCase(); // Try as-is
            };
        }
        
        // Validate page size (max 100)
        int validatedSize = Math.min(size, 100);
        Sort sort = buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(page, validatedSize, sort);
        
        Page<CreatorDTO> creators = creatorDiscoveryService.searchCreators(
                search, normalizedCategories, normalizedPlatform, minFollowers, maxFollowers, pageable
        );
        
        return ResponseEntity.ok(creators);
    }
    
    /**
     * Get creator by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Get creator by ID", description = "Get detailed creator profile (Brand only)")
    public ResponseEntity<CreatorDTO> getCreatorById(@PathVariable String id) {
        CreatorDTO creator = creatorDiscoveryService.getCreatorById(id);
        return ResponseEntity.ok(creator);
    }
    
    private Sort buildSort(String sortBy, String sortDirection) {
        if (sortBy == null || sortBy.isEmpty()) {
            return Sort.by(Sort.Direction.DESC, "followerCount");
        }
        
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection) 
                ? Sort.Direction.ASC 
                : Sort.Direction.DESC;
        
        return switch (sortBy.toLowerCase()) {
            case "follower_count", "followers" -> Sort.by(direction, "followerCount");
            case "engagement_rate", "engagement" -> Sort.by(direction, "engagementRate");
            case "username" -> Sort.by(direction, "username");
            default -> Sort.by(Sort.Direction.DESC, "followerCount");
        };
    }
}

