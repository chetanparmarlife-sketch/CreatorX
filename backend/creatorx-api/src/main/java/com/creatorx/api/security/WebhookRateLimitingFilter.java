package com.creatorx.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * WebhookRateLimitingFilter
 *
 * Protects the Razorpay payment webhook from being spammed.
 * Limits requests to 60 per minute per IP address.
 * Uses Redis to track request counts.
 *
 * Why this matters: without this, anyone can send fake payment
 * events to our webhook and potentially trigger payment processing.
 */
@Component
@Slf4j
@ConditionalOnBean(StringRedisTemplate.class)
public class WebhookRateLimitingFilter extends OncePerRequestFilter {

    private static final String WEBHOOK_PATH = "/api/v1/webhooks/razorpay";
    private static final String RATE_LIMIT_PREFIX = "rate_limit:webhook:";
    private static final int WINDOW_SECONDS = 60;

    private final StringRedisTemplate redisTemplate;
    private final List<String> allowedIps;
    private final int requestsPerMinute;

    public WebhookRateLimitingFilter(
            StringRedisTemplate redisTemplate,
            @Value("${razorpay.webhook.allowed-ips:}") String allowedIps,
            @Value("${razorpay.webhook.rate-limit.requests-per-minute:60}") int requestsPerMinute) {
        this.redisTemplate = redisTemplate;
        this.allowedIps = parseAllowedIps(allowedIps);
        this.requestsPerMinute = requestsPerMinute;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        if (!isRazorpayWebhook(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);

        // Configured Razorpay IPs are trusted senders, so they bypass only this spam limiter.
        if (isAllowedIp(clientIp)) {
            filterChain.doFilter(request, response);
            return;
        }

        String redisKey = buildRedisKey(clientIp);

        try {
            Long currentCount = redisTemplate.opsForValue().increment(redisKey);
            if (currentCount == null) {
                currentCount = 1L;
            }

            if (currentCount == 1L) {
                redisTemplate.expire(redisKey, Duration.ofSeconds(WINDOW_SECONDS));
            }

            if (currentCount > requestsPerMinute) {
                Long ttl = redisTemplate.getExpire(redisKey, TimeUnit.SECONDS);
                int retryAfter = ttl != null && ttl > 0 ? ttl.intValue() : WINDOW_SECONDS;
                log.warn("Webhook rate limit triggered for IP={} at {}", clientIp, Instant.now());
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setHeader("Retry-After", String.valueOf(retryAfter));
                response.getWriter().write("{\"error\": \"Rate limit exceeded\", \"retryAfter\": 60}");
                return;
            }

            filterChain.doFilter(request, response);
        } catch (Exception e) {
            // Redis outages should not stop signed Razorpay webhooks from being processed.
            log.error("Webhook rate limiting failed, allowing request: {}", e.getMessage());
            filterChain.doFilter(request, response);
        }
    }

    private boolean isRazorpayWebhook(HttpServletRequest request) {
        return "POST".equalsIgnoreCase(request.getMethod())
                && WEBHOOK_PATH.equals(request.getRequestURI());
    }

    private String buildRedisKey(String clientIp) {
        long windowStart = System.currentTimeMillis() / (WINDOW_SECONDS * 1000L);
        return RATE_LIMIT_PREFIX + clientIp + ":" + windowStart;
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }

        return request.getRemoteAddr();
    }

    private List<String> parseAllowedIps(String rawAllowedIps) {
        if (rawAllowedIps == null || rawAllowedIps.isBlank()) {
            return List.of();
        }

        return Arrays.stream(rawAllowedIps.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .toList();
    }

    private boolean isAllowedIp(String clientIp) {
        return allowedIps.stream().anyMatch(allowedIp -> ipMatches(clientIp, allowedIp));
    }

    private boolean ipMatches(String clientIp, String allowedIp) {
        if (allowedIp.contains("/")) {
            return cidrMatches(clientIp, allowedIp);
        }

        return allowedIp.equals(clientIp);
    }

    private boolean cidrMatches(String clientIp, String cidr) {
        try {
            String[] parts = cidr.split("/");
            if (parts.length != 2) {
                return false;
            }

            byte[] clientBytes = InetAddress.getByName(clientIp).getAddress();
            byte[] networkBytes = InetAddress.getByName(parts[0]).getAddress();
            if (clientBytes.length != networkBytes.length) {
                return false;
            }

            int prefixLength = Integer.parseInt(parts[1]);
            int fullBytes = prefixLength / 8;
            int remainingBits = prefixLength % 8;

            for (int i = 0; i < fullBytes; i++) {
                if (clientBytes[i] != networkBytes[i]) {
                    return false;
                }
            }

            if (remainingBits == 0) {
                return true;
            }

            int mask = (-1) << (8 - remainingBits);
            return (clientBytes[fullBytes] & mask) == (networkBytes[fullBytes] & mask);
        } catch (NumberFormatException | UnknownHostException | ArrayIndexOutOfBoundsException e) {
            log.warn("Ignoring invalid Razorpay webhook allowed IP entry: {}", cidr);
            return false;
        }
    }
}
