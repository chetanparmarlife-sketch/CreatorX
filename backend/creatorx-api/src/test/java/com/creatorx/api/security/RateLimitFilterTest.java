package com.creatorx.api.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockFilterChain;

import jakarta.servlet.ServletException;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for RateLimitFilter
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("RateLimitFilter Tests")
class RateLimitFilterTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private RateLimitFilter rateLimitFilter;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        rateLimitFilter = new RateLimitFilter(redisTemplate);
    }

    @Test
    @DisplayName("Should allow request when under rate limit")
    void shouldAllowRequestUnderLimit() throws ServletException, IOException {
        // Given
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/campaigns");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        when(valueOperations.increment(anyString())).thenReturn(1L);
        when(redisTemplate.getExpire(anyString(), any(TimeUnit.class))).thenReturn(60L);

        // When
        rateLimitFilter.doFilterInternal(request, response, filterChain);

        // Then
        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getHeader("X-RateLimit-Limit")).isEqualTo("100");
        assertThat(response.getHeader("X-RateLimit-Remaining")).isEqualTo("99");
    }

    @Test
    @DisplayName("Should return 429 when rate limit exceeded")
    void shouldReturn429WhenLimitExceeded() throws ServletException, IOException {
        // Given
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/campaigns");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        when(valueOperations.increment(anyString())).thenReturn(101L); // Over limit
        when(redisTemplate.getExpire(anyString(), any(TimeUnit.class))).thenReturn(30L);

        // When
        rateLimitFilter.doFilterInternal(request, response, filterChain);

        // Then
        assertThat(response.getStatus()).isEqualTo(429);
        assertThat(response.getContentType()).isEqualTo("application/json");
        assertThat(response.getContentAsString()).contains("Too Many Requests");
        assertThat(response.getHeader("Retry-After")).isEqualTo("30");
    }

    @Test
    @DisplayName("Should apply auth limit for login endpoint")
    void shouldApplyAuthLimitForLogin() throws ServletException, IOException {
        // Given
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        when(valueOperations.increment(anyString())).thenReturn(1L);
        when(redisTemplate.getExpire(anyString(), any(TimeUnit.class))).thenReturn(60L);

        // When
        rateLimitFilter.doFilterInternal(request, response, filterChain);

        // Then
        assertThat(response.getHeader("X-RateLimit-Limit")).isEqualTo("5"); // Auth limit
    }

    @Test
    @DisplayName("Should apply payment limit for withdrawal endpoint")
    void shouldApplyPaymentLimitForWithdrawal() throws ServletException, IOException {
        // Given
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/wallet/withdraw");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        when(valueOperations.increment(anyString())).thenReturn(1L);
        when(redisTemplate.getExpire(anyString(), any(TimeUnit.class))).thenReturn(60L);

        // When
        rateLimitFilter.doFilterInternal(request, response, filterChain);

        // Then
        assertThat(response.getHeader("X-RateLimit-Limit")).isEqualTo("10"); // Payment limit
    }

    @Test
    @DisplayName("Should skip rate limiting for health check")
    void shouldSkipRateLimitingForHealthCheck() throws ServletException, IOException {
        // Given
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/health");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        // When
        rateLimitFilter.doFilterInternal(request, response, filterChain);

        // Then
        // No interaction with Redis
        verify(redisTemplate, never()).opsForValue();
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    @DisplayName("Should skip rate limiting for webhooks")
    void shouldSkipRateLimitingForWebhooks() throws ServletException, IOException {
        // Given
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/webhooks/razorpay");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        // When
        rateLimitFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(redisTemplate, never()).opsForValue();
    }

    @Test
    @DisplayName("Should use X-Forwarded-For header for client IP")
    void shouldUseXForwardedForHeader() throws ServletException, IOException {
        // Given
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/campaigns");
        request.addHeader("X-Forwarded-For", "203.0.113.50, 70.41.3.18");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        when(valueOperations.increment(contains("203.0.113.50"))).thenReturn(1L);
        when(redisTemplate.getExpire(anyString(), any(TimeUnit.class))).thenReturn(60L);

        // When
        rateLimitFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(valueOperations).increment(contains("203.0.113.50"));
    }

    @Test
    @DisplayName("Should allow request when Redis is unavailable (fail-open)")
    void shouldAllowRequestWhenRedisUnavailable() throws ServletException, IOException {
        // Given
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/campaigns");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        when(valueOperations.increment(anyString())).thenThrow(new RuntimeException("Redis unavailable"));

        // When
        rateLimitFilter.doFilterInternal(request, response, filterChain);

        // Then - request should be allowed (fail-open)
        assertThat(response.getStatus()).isEqualTo(200);
    }
}
