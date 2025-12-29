package com.creatorx.api.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting configuration for API endpoints
 * Uses Bucket4j for token bucket algorithm
 */
@Configuration
public class RateLimitingConfig {
    
    // Rate limits per endpoint
    public static final int AUTH_RATE_LIMIT = 5; // 5 requests per minute for auth endpoints
    public static final int DEFAULT_RATE_LIMIT = 100; // 100 requests per minute for general endpoints
    public static final int SEARCH_RATE_LIMIT = 30; // 30 requests per minute for search
    public static final int UPLOAD_RATE_LIMIT = 10; // 10 requests per minute for file uploads
    
    // Cache for user buckets (in production, use Redis)
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    
    /**
     * Get or create rate limit bucket for a user
     * 
     * @param userId User ID or IP address
     * @param limitPerMinute Rate limit per minute
     * @return Bucket instance
     */
    public Bucket resolveBucket(String userId, int limitPerMinute) {
        return cache.computeIfAbsent(userId, key -> {
            Bandwidth limit = Bandwidth.classic(limitPerMinute, Refill.intervally(limitPerMinute, Duration.ofMinutes(1)));
            return Bucket.builder()
                    .addLimit(limit)
                    .build();
        });
    }
    
    /**
     * Clear bucket cache (useful for testing)
     */
    public void clearCache() {
        cache.clear();
    }
}
