package com.creatorx.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Standardized pagination response wrapper for frontend compatibility.
 * Converts Spring Data Page format to a simpler { items, page, size, total }
 * format.
 *
 * @param <T> The type of items in the paginated response
 */
@Schema(description = "Paginated response containing items and pagination metadata")
public class PaginatedResponse<T> {

    @Schema(description = "List of items for the current page", required = true)
    private List<T> items;

    @Schema(description = "Current page number (0-indexed)", example = "0", required = true)
    private int page;

    @Schema(description = "Number of items per page", example = "20", required = true)
    private int size;

    @Schema(description = "Total number of items across all pages", example = "100", required = true)
    private long total;

    @Schema(description = "Total number of pages", example = "5")
    private int totalPages;

    @Schema(description = "Whether this is the first page", example = "true")
    private boolean first;

    @Schema(description = "Whether this is the last page", example = "false")
    private boolean last;

    @Schema(description = "Whether there is a next page available", example = "true")
    private boolean hasNext;

    @Schema(description = "Whether there is a previous page available", example = "false")
    private boolean hasPrevious;

    /**
     * Default constructor for serialization frameworks
     */
    public PaginatedResponse() {
    }

    /**
     * Constructor with all fields
     */
    public PaginatedResponse(List<T> items, int page, int size, long total, int totalPages,
            boolean first, boolean last, boolean hasNext, boolean hasPrevious) {
        this.items = items;
        this.page = page;
        this.size = size;
        this.total = total;
        this.totalPages = totalPages;
        this.first = first;
        this.last = last;
        this.hasNext = hasNext;
        this.hasPrevious = hasPrevious;
    }

    /**
     * Static factory method to create PaginatedResponse from Spring Data Page
     *
     * @param page Spring Data Page object
     * @param <T>  The type of content in the page
     * @return PaginatedResponse with normalized format
     */
    public static <T> PaginatedResponse<T> from(Page<T> page) {
        return new PaginatedResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast(),
                page.hasNext(),
                page.hasPrevious());
    }

    /**
     * Static factory method to create PaginatedResponse from a list and pagination
     * metadata
     * Useful when you have already converted DTOs and want to create a paginated
     * response
     *
     * @param items List of items
     * @param page  Page number (0-indexed)
     * @param size  Items per page
     * @param total Total number of items
     * @param <T>   The type of items
     * @return PaginatedResponse with calculated pagination metadata
     */
    public static <T> PaginatedResponse<T> of(List<T> items, int page, int size, long total) {
        int totalPages = (int) Math.ceil((double) total / size);
        boolean first = page == 0;
        boolean last = page >= totalPages - 1;
        boolean hasNext = page < totalPages - 1;
        boolean hasPrevious = page > 0;

        return new PaginatedResponse<>(
                items,
                page,
                size,
                total,
                totalPages,
                first,
                last,
                hasNext,
                hasPrevious);
    }

    // Getters and Setters

    public List<T> getItems() {
        return items;
    }

    public void setItems(List<T> items) {
        this.items = items;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public boolean isFirst() {
        return first;
    }

    public void setFirst(boolean first) {
        this.first = first;
    }

    public boolean isLast() {
        return last;
    }

    public void setLast(boolean last) {
        this.last = last;
    }

    public boolean isHasNext() {
        return hasNext;
    }

    public void setHasNext(boolean hasNext) {
        this.hasNext = hasNext;
    }

    public boolean isHasPrevious() {
        return hasPrevious;
    }

    public void setHasPrevious(boolean hasPrevious) {
        this.hasPrevious = hasPrevious;
    }

    @Override
    public String toString() {
        return "PaginatedResponse{" +
                "items=" + (items != null ? items.size() : 0) + " items" +
                ", page=" + page +
                ", size=" + size +
                ", total=" + total +
                ", totalPages=" + totalPages +
                ", first=" + first +
                ", last=" + last +
                ", hasNext=" + hasNext +
                ", hasPrevious=" + hasPrevious +
                '}';
    }
}
