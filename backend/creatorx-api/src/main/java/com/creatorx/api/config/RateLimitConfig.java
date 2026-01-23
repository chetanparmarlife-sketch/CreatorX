package com.creatorx.api.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Rate limiting configuration properties
 * 
 * Configure via application.yml:
 * creatorx:
 * rate-limit:
 * enabled: true
 * general-limit: 100
 * auth-limit: 5
 * payment-limit: 10
 * window-seconds: 60
 */
@Configuration
@ConfigurationProperties(prefix = "creatorx.rate-limit")
@Getter
@Setter
public class RateLimitConfig {

    /**
     * Enable/disable rate limiting
     */
    private boolean enabled = true;

    /**
     * Maximum requests per minute for general APIs
     */
    private int generalLimit = 100;

    /**
     * Maximum requests per minute for auth endpoints (login, register, OTP)
     */
    private int authLimit = 5;

    /**
     * Maximum requests per minute for payment operations (withdraw, payout)
     */
    private int paymentLimit = 10;

    /**
     * Time window in seconds for rate limiting
     */
    private int windowSeconds = 60;

    /**
     * Redis key prefix for rate limit counters
     */
    private String keyPrefix = "rate_limit:";
}
