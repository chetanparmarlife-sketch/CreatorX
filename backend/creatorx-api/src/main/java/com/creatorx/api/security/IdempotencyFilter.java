package com.creatorx.api.security;

import com.creatorx.repository.IdempotencyKeyRepository;
import com.creatorx.repository.entity.IdempotencyKey;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

/**
 * Filter for idempotent request handling
 * Purpose: Prevent duplicate API requests for sensitive operations
 * Phase: Phase 4 - Real Money Payouts
 *
 * Behavior:
 * - Primary header: "Idempotency-Key" (standard)
 * - Legacy fallback: "Idempotent-Key" (for backwards compatibility only)
 * - Only applies to specific POST endpoints (withdrawals, bank accounts, payout approvals)
 * - Missing key => passthrough (no idempotency)
 * - Cached response => return cached response immediately
 * - No cache => process request, cache 2xx responses
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class IdempotencyFilter extends OncePerRequestFilter {

    // Primary header name (standard)
    private static final String IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";
    // Legacy header name (for backwards compatibility only)
    private static final String LEGACY_IDEMPOTENT_KEY_HEADER = "Idempotent-Key";
    private static final long IDEMPOTENCY_TTL_HOURS = 24;

    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    /**
     * Endpoints that support idempotency
     * Only POST requests to these paths will be idempotent
     */
    private static final Set<String> IDEMPOTENT_ENDPOINTS = Set.of(
            "/api/v1/wallet/withdraw",
            "/api/v1/wallet/bank-accounts",
            "/api/v1/admin/payouts/*/approve"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Only apply to POST requests
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // Only apply to idempotent endpoints
        if (!isIdempotentEndpoint(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        // Get idempotency key from headers (support both names)
        String idempotencyKey = getIdempotencyKey(request);

        // No key => passthrough (no idempotency)
        if (idempotencyKey == null || idempotencyKey.isEmpty()) {
            log.debug("No idempotency key provided for {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        log.info("Processing idempotent request: key={}, uri={}", idempotencyKey, request.getRequestURI());

        // Check for cached response
        Optional<IdempotencyKey> cachedResponse = idempotencyKeyRepository
                .findByKeyAndNotExpired(idempotencyKey, LocalDateTime.now());

        if (cachedResponse.isPresent()) {
            IdempotencyKey cached = cachedResponse.get();
            log.info("Returning cached response for idempotency key: {}", idempotencyKey);

            // Return cached response
            response.setStatus(cached.getResponseStatusCode() != null ? cached.getResponseStatusCode() : 200);
            if (cached.getContentType() != null) {
                response.setContentType(cached.getContentType());
            }
            if (cached.getResponseBody() != null) {
                response.getWriter().write(cached.getResponseBody());
            }
            return;
        }

        // Wrap response to capture output
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        try {
            // Process request
            filterChain.doFilter(request, responseWrapper);

            // Cache 2xx responses only
            int status = responseWrapper.getStatus();
            if (status >= 200 && status < 300) {
                cacheResponse(idempotencyKey, responseWrapper);
            }

        } finally {
            // Copy cached content to response
            responseWrapper.copyBodyToResponse();
        }
    }

    /**
     * Check if the request URI matches any idempotent endpoint pattern
     */
    private boolean isIdempotentEndpoint(String requestUri) {
        for (String pattern : IDEMPOTENT_ENDPOINTS) {
            if (pathMatcher.match(pattern, requestUri)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get idempotency key from request headers.
     * Primary: "Idempotency-Key" (standard)
     * Legacy fallback: "Idempotent-Key" (for backwards compatibility only)
     */
    private String getIdempotencyKey(HttpServletRequest request) {
        String key = request.getHeader(IDEMPOTENCY_KEY_HEADER);
        if (key == null || key.isEmpty()) {
            // Legacy fallback - accept old header name for backwards compatibility
            key = request.getHeader(LEGACY_IDEMPOTENT_KEY_HEADER);
            if (key != null && !key.isEmpty()) {
                log.debug("Using legacy Idempotent-Key header - please migrate to Idempotency-Key");
            }
        }
        return key;
    }

    /**
     * Cache successful response for future replay
     */
    private void cacheResponse(String key, ContentCachingResponseWrapper response) {
        try {
            byte[] content = response.getContentAsByteArray();
            String responseBody = new String(content, StandardCharsets.UTF_8);
            String contentType = response.getContentType();
            int status = response.getStatus();

            IdempotencyKey idempotencyKey = IdempotencyKey.builder()
                    .key(key)
                    .responseStatusCode(status)
                    .responseBody(responseBody)
                    .contentType(contentType)
                    .expiresAt(LocalDateTime.now().plusHours(IDEMPOTENCY_TTL_HOURS))
                    .build();

            idempotencyKeyRepository.save(idempotencyKey);
            log.info("Cached response for idempotency key: {} (status={}, contentType={})",
                    key, status, contentType);

        } catch (Exception e) {
            // Log but don't fail the request if caching fails
            log.error("Failed to cache idempotent response for key {}: {}", key, e.getMessage());
        }
    }
}
