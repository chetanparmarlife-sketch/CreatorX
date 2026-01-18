package com.creatorx.service.razorpay;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for Razorpay API integration
 * Purpose: Initialize Razorpay client with API credentials from environment
 * Phase: Phase 4 - Real Money Payouts
 *
 * IMPORTANT: Never expose Razorpay keys to mobile app - server-side only
 */
@Configuration
@Slf4j
@Getter
public class RazorpayConfig {

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    @Value("${razorpay.webhook-secret:}")
    private String webhookSecret;

    @Value("${razorpay.payout.mode:test}")
    private String payoutMode;

    @Value("${razorpay.payout.account-number:}")
    private String accountNumber;

    /**
     * Create Razorpay client bean
     * Initializes with API key and secret from environment variables
     *
     * @return RazorpayClient instance
     * @throws RuntimeException if initialization fails
     */
    @Bean
    public RazorpayClient razorpayClient() {
        try {
            if (keyId == null || keyId.isEmpty() || keySecret == null || keySecret.isEmpty()) {
                log.warn("Razorpay credentials not configured. Payout functionality will be disabled.");
                log.warn("Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables");
                // Return null - service will handle gracefully
                return null;
            }

            log.info("Initializing Razorpay client in {} mode", payoutMode);
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            log.info("Razorpay client initialized successfully");
            return client;

        } catch (RazorpayException e) {
            log.error("Failed to initialize Razorpay client: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to initialize Razorpay client", e);
        }
    }

    /**
     * Check if Razorpay is configured and ready
     * @return true if Razorpay credentials are configured
     */
    public boolean isConfigured() {
        return keyId != null && !keyId.isEmpty() &&
               keySecret != null && !keySecret.isEmpty();
    }

    /**
     * Check if running in test mode
     * @return true if payout mode is test
     */
    public boolean isTestMode() {
        return "test".equalsIgnoreCase(payoutMode);
    }
}
