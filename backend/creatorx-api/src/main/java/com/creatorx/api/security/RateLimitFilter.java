package com.creatorx.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Redis-based distributed rate limiting filter
 * 
 * Rate limits:
 * - General APIs: 100 requests per minute per IP
 * - Auth (login/register): 5 requests per minute per IP
 * - Payment operations: 10 requests per minute per IP
 * 
 * Uses sliding window algorithm with Redis for distributed environments.
 * 
 * Note: This filter is only active when Redis is available (StringRedisTemplate
 * bean exists).
 * In test environments without Redis, this filter is not loaded.
 */
@Component
@Slf4j
@RequiredArgsConstructor
@ConditionalOnBean(StringRedisTemplate.class)
public class RateLimitFilter extends OncePerRequestFilter {

    private final StringRedisTemplate redisTemplate;

    // Rate limit configurations
    private static final int GENERAL_LIMIT = 100; // requests per minute
    private static final int AUTH_LIMIT = 5; // requests per minute
    private static final int PAYMENT_LIMIT = 10; // requests per minute
    private static final int WINDOW_SECONDS = 60; // 1 minute window

    // Redis key prefix
    private static final String RATE_LIMIT_PREFIX = "rate_limit:";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Skip rate limiting for certain paths
        if (shouldSkipRateLimiting(path, method)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        RateLimitType limitType = getRateLimitType(path);
        int limit = getLimit(limitType);

        String redisKey = buildRedisKey(clientIp, limitType);

        try {
            RateLimitResult result = checkRateLimit(redisKey, limit);

            // Add rate limit headers
            response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(result.remaining()));
            response.setHeader("X-RateLimit-Reset", String.valueOf(result.resetTime()));

            if (!result.allowed()) {
                log.warn("Rate limit exceeded for IP={} path={} type={}", clientIp, path, limitType);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setHeader("Retry-After", String.valueOf(result.retryAfter()));
                response.getWriter().write(buildErrorResponse(limit, result.retryAfter()));
                return;
            }

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            // If Redis is unavailable, allow the request (fail-open)
            log.error("Rate limiting failed, allowing request: {}", e.getMessage());
            filterChain.doFilter(request, response);
        }
    }

    private boolean shouldSkipRateLimiting(String path, String method) {
        // Skip OPTIONS requests (CORS preflight)
        if ("OPTIONS".equals(method)) {
            return true;
        }

        // Skip health checks
        if (path.contains("/health") || path.contains("/actuator")) {
            return true;
        }

        // Skip static resources
        if (path.contains("/swagger") || path.contains("/api-docs")) {
            return true;
        }

        // Skip webhooks (they have their own authentication)
        if (path.contains("/webhooks/")) {
            return true;
        }

        return false;
    }

    private RateLimitType getRateLimitType(String path) {
        if (path.contains("/auth/login") || path.contains("/auth/register") ||
                path.contains("/auth/otp") || path.contains("/auth/reset")) {
            return RateLimitType.AUTH;
        }

        if (path.contains("/wallet/withdraw") || path.contains("/payment") ||
                path.contains("/payout") || path.contains("/bank-account")) {
            return RateLimitType.PAYMENT;
        }

        return RateLimitType.GENERAL;
    }

    private int getLimit(RateLimitType type) {
        return switch (type) {
            case AUTH -> AUTH_LIMIT;
            case PAYMENT -> PAYMENT_LIMIT;
            case GENERAL -> GENERAL_LIMIT;
        };
    }

    private String buildRedisKey(String clientIp, RateLimitType type) {
        long windowStart = System.currentTimeMillis() / (WINDOW_SECONDS * 1000);
        return RATE_LIMIT_PREFIX + type.name().toLowerCase() + ":" + clientIp + ":" + windowStart;
    }

    private RateLimitResult checkRateLimit(String key, int limit) {
        Long currentCount = redisTemplate.opsForValue().increment(key);

        if (currentCount == null) {
            currentCount = 1L;
        }

        // Set expiry on first request
        if (currentCount == 1) {
            redisTemplate.expire(key, Duration.ofSeconds(WINDOW_SECONDS));
        }

        long remaining = Math.max(0, limit - currentCount);
        Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
        long resetTime = System.currentTimeMillis() / 1000 + (ttl != null ? ttl : WINDOW_SECONDS);

        if (currentCount > limit) {
            int retryAfter = ttl != null ? ttl.intValue() : WINDOW_SECONDS;
            return new RateLimitResult(false, 0, resetTime, retryAfter);
        }

        return new RateLimitResult(true, (int) remaining, resetTime, 0);
    }

    private String getClientIp(HttpServletRequest request) {
        // Check for forwarded IP (behind proxy/load balancer)
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Take the first IP in the chain (original client)
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    private String buildErrorResponse(int limit, int retryAfter) {
        return String.format("""
                {
                    "error": "Too Many Requests",
                    "message": "Rate limit exceeded. Maximum %d requests per minute allowed.",
                    "status": 429,
                    "retryAfter": %d
                }
                """, limit, retryAfter);
    }

    private enum RateLimitType {
        GENERAL,
        AUTH,
        PAYMENT
    }

    private record RateLimitResult(
            boolean allowed,
            int remaining,
            long resetTime,
            int retryAfter) {
    }
}
