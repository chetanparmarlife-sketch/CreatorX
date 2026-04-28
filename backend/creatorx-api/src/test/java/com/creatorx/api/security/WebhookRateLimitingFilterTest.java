package com.creatorx.api.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * Tests the dedicated Razorpay webhook limiter so fake webhook floods are blocked before processing.
 */
@ExtendWith(MockitoExtension.class)
class WebhookRateLimitingFilterTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private WebhookRateLimitingFilter filter;

    @BeforeEach
    void setUp() {
        Map<String, AtomicLong> counters = new ConcurrentHashMap<>();
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(anyString()))
                .thenAnswer(invocation -> counters
                        .computeIfAbsent(invocation.getArgument(0), key -> new AtomicLong())
                        .incrementAndGet());
        when(redisTemplate.expire(anyString(), any(Duration.class))).thenReturn(true);
        lenient().when(redisTemplate.getExpire(anyString(), eq(TimeUnit.SECONDS))).thenReturn(60L);

        filter = new WebhookRateLimitingFilter(redisTemplate, "", 60);
    }

    @Test
    void normalRequestWithinLimitPassesThrough() throws Exception {
        MockHttpServletResponse response = performWebhookRequest("192.0.2.10");

        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void sixtyFirstRequestInSameMinuteFromSameIpIsBlocked() throws Exception {
        for (int i = 0; i < 60; i++) {
            performWebhookRequest("192.0.2.10");
        }

        MockHttpServletResponse response = performWebhookRequest("192.0.2.10");

        assertThat(response.getStatus()).isEqualTo(429);
        assertThat(response.getContentAsString())
                .isEqualTo("{\"error\": \"Rate limit exceeded\", \"retryAfter\": 60}");
    }

    @Test
    void requestFromNewIpAfterLimitPassesThrough() throws Exception {
        for (int i = 0; i < 61; i++) {
            performWebhookRequest("192.0.2.10");
        }

        MockHttpServletResponse response = performWebhookRequest("192.0.2.11");

        assertThat(response.getStatus()).isEqualTo(200);
    }

    private MockHttpServletResponse performWebhookRequest(String ipAddress) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/webhooks/razorpay");
        request.setRemoteAddr(ipAddress);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        filter.doFilter(request, response, filterChain);

        return response;
    }
}
