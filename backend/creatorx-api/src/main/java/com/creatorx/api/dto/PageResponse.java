package com.creatorx.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Normalized paginated response format for all API endpoints.
 * Provides consistent structure: { items, page, size, total, totalPages,
 * hasMore }
 * 
 * @param <T> The type of items in the page
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {

    /**
     * List of items for the current page
     */
    private List<T> items;

    /**
     * Current page number (0-indexed)
     */
    private int page;

    /**
     * Page size (number of items per page)
     */
    private int size;

    /**
     * Total number of items across all pages
     */
    private long total;

    /**
     * Total number of pages
     */
    private int totalPages;

    /**
     * Whether there are more pages after this one
     */
    private boolean hasMore;

    /**
     * Create a PageResponse from a Spring Page
     * 
     * @param springPage The Spring Page object
     * @param <T>        The type of items
     * @return A normalized PageResponse
     */
    public static <T> PageResponse<T> from(Page<T> springPage) {
        return PageResponse.<T>builder()
                .items(springPage.getContent())
                .page(springPage.getNumber())
                .size(springPage.getSize())
                .total(springPage.getTotalElements())
                .totalPages(springPage.getTotalPages())
                .hasMore(springPage.hasNext())
                .build();
    }

    /**
     * Create a PageResponse from a Spring Page with mapped content
     * 
     * @param springPage    The Spring Page object (source)
     * @param mappedContent The already-mapped content list
     * @param <T>           The type of mapped items
     * @param <S>           The type of source items (unused but needed for type
     *                      inference)
     * @return A normalized PageResponse
     */
    public static <T, S> PageResponse<T> from(Page<S> springPage, List<T> mappedContent) {
        return PageResponse.<T>builder()
                .items(mappedContent)
                .page(springPage.getNumber())
                .size(springPage.getSize())
                .total(springPage.getTotalElements())
                .totalPages(springPage.getTotalPages())
                .hasMore(springPage.hasNext())
                .build();
    }
}
