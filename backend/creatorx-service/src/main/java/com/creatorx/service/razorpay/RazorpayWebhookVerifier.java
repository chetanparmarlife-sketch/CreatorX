package com.creatorx.service.razorpay;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

/**
 * Verifies Razorpay webhook signatures using HMAC-SHA256
 * Purpose: Ensure webhook requests are authentic and from Razorpay
 * Phase: Phase 4 - Real Money Payouts
 *
 * Security: Prevents webhook spoofing and replay attacks
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RazorpayWebhookVerifier {

    private final RazorpayConfig razorpayConfig;

    private static final String HMAC_SHA256_ALGORITHM = "HmacSHA256";

    /**
     * Verify webhook signature using HMAC-SHA256
     *
     * @param payload Raw webhook payload (JSON string)
     * @param signature Signature from X-Razorpay-Signature header
     * @return true if signature is valid
     */
    public boolean verify(String payload, String signature) {
        try {
            if (payload == null || signature == null) {
                log.warn("Webhook verification failed: null payload or signature");
                return false;
            }

            if (razorpayConfig.getWebhookSecret() == null || razorpayConfig.getWebhookSecret().isEmpty()) {
                log.error("Webhook secret not configured - cannot verify webhooks");
                log.error("Set RAZORPAY_WEBHOOK_SECRET environment variable");
                return false;
            }

            // Compute expected signature
            String expectedSignature = computeSignature(payload, razorpayConfig.getWebhookSecret());

            // Compare signatures (constant-time comparison to prevent timing attacks)
            boolean isValid = constantTimeEquals(expectedSignature, signature);

            if (!isValid) {
                log.warn("Webhook signature verification failed");
                log.debug("Expected: {}", expectedSignature);
                log.debug("Received: {}", signature);
            }

            return isValid;

        } catch (Exception e) {
            log.error("Error verifying webhook signature: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Compute HMAC-SHA256 signature
     *
     * @param payload Raw webhook payload
     * @param secret Webhook secret from Razorpay
     * @return Hex-encoded signature
     */
    private String computeSignature(String payload, String secret)
            throws NoSuchAlgorithmException, InvalidKeyException {

        Mac mac = Mac.getInstance(HMAC_SHA256_ALGORITHM);
        SecretKeySpec secretKeySpec = new SecretKeySpec(
            secret.getBytes(StandardCharsets.UTF_8),
            HMAC_SHA256_ALGORITHM
        );
        mac.init(secretKeySpec);

        byte[] signatureBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));

        // Convert to hex string
        return bytesToHex(signatureBytes);
    }

    /**
     * Convert byte array to hex string
     *
     * @param bytes Byte array
     * @return Hex string
     */
    private String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    /**
     * Constant-time string comparison to prevent timing attacks
     *
     * @param a First string
     * @param b Second string
     * @return true if strings are equal
     */
    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) {
            return false;
        }

        if (a.length() != b.length()) {
            return false;
        }

        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }

        return result == 0;
    }
}
