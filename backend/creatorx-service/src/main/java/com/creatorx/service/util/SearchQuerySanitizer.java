package com.creatorx.service.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Utility class for sanitizing search queries to prevent injection attacks
 */
@Slf4j
@Component
public class SearchQuerySanitizer {
    
    // Pattern to match potentially dangerous characters in search queries
    private static final Pattern DANGEROUS_PATTERN = Pattern.compile("[<>\"'%;()&|!]");
    
    // Maximum search query length
    private static final int MAX_SEARCH_LENGTH = 200;
    
    /**
     * Sanitize search query for PostgreSQL full-text search
     * Removes dangerous characters and limits length
     * 
     * @param query Raw search query from user
     * @return Sanitized query safe for use in database queries
     */
    public String sanitize(String query) {
        if (query == null || query.trim().isEmpty()) {
            return null;
        }
        
        // Trim whitespace
        String sanitized = query.trim();
        
        // Limit length
        if (sanitized.length() > MAX_SEARCH_LENGTH) {
            sanitized = sanitized.substring(0, MAX_SEARCH_LENGTH);
            log.warn("Search query truncated to {} characters", MAX_SEARCH_LENGTH);
        }
        
        // Remove dangerous characters that could be used for injection
        // Note: plainto_tsquery already handles most of this, but we add extra safety
        sanitized = DANGEROUS_PATTERN.matcher(sanitized).replaceAll("");
        
        // Remove multiple spaces
        sanitized = sanitized.replaceAll("\\s+", " ");
        
        return sanitized;
    }
    
    /**
     * Validate search query before use
     * 
     * @param query Search query to validate
     * @return true if query is safe to use
     */
    public boolean isValid(String query) {
        if (query == null || query.trim().isEmpty()) {
            return false;
        }
        
        if (query.length() > MAX_SEARCH_LENGTH) {
            return false;
        }
        
        // Check for dangerous patterns
        return !DANGEROUS_PATTERN.matcher(query).find();
    }
}

