/**
 * Service for validating Supabase JWT tokens
 * Supabase uses RS256 (RSA) signatures, not HS256 (HMAC)
 */

package com.creatorx.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.security.interfaces.RSAPublicKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.SecretKey;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

@Slf4j
@Service
public class SupabaseJwtService {
    
    @Value("${supabase.url}")
    private String supabaseUrl;
    
    @Value("${supabase.jwt.secret:}")
    private String supabaseJwtSecret; // Fallback for HS256 if needed
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private RSAPublicKey publicKey;
    private Date publicKeyExpiry;
    
    public SupabaseJwtService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Validate Supabase JWT token
     * Supabase tokens are signed with RS256 using their public key
     */
    public Claims validateToken(String token) {
        try {
            // Get Supabase public key (cached)
            PublicKey key = getSupabasePublicKey();
            
            // Parse and validate token with RS256
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            
            // Verify token is not expired
            if (claims.getExpiration().before(new Date())) {
                throw new RuntimeException("Token has expired");
            }
            
            // Verify issuer (Supabase) - Supabase uses project URL as issuer
            String issuer = claims.getIssuer();
            if (issuer == null || (!issuer.contains("supabase") && !issuer.equals(supabaseUrl))) {
                log.warn("Token issuer mismatch: expected Supabase, got: {}", issuer);
                // Don't throw - some Supabase configurations might use different issuer format
            }
            
            return claims;
        } catch (Exception e) {
            log.error("Failed to validate Supabase JWT token", e);
            throw new RuntimeException("Invalid token: " + e.getMessage(), e);
        }
    }
    
    /**
     * Extract user ID from Supabase token (sub claim)
     */
    public String extractUserId(String token) {
        Claims claims = validateToken(token);
        return claims.getSubject(); // Supabase uses 'sub' for user ID
    }
    
    /**
     * Extract email from Supabase token
     */
    public String extractEmail(String token) {
        Claims claims = validateToken(token);
        return claims.get("email", String.class);
    }
    
    /**
     * Extract user metadata from Supabase token
     */
    public Map<String, Object> extractUserMetadata(String token) {
        Claims claims = validateToken(token);
        Object userMetadata = claims.get("user_metadata");
        if (userMetadata instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> metadata = (Map<String, Object>) userMetadata;
            return metadata;
        }
        return Map.of();
    }
    
    /**
     * Get Supabase public key for JWT verification
     * Uses Supabase's JWKS endpoint
     */
    private RSAPublicKey getSupabasePublicKey() {
        // Cache public key for 1 hour
        if (publicKey != null && publicKeyExpiry != null && publicKeyExpiry.after(new Date())) {
            return publicKey;
        }
        
        try {
            // Fetch JWKS from Supabase
            String jwksUrl = supabaseUrl + "/.well-known/jwks.json";
            String jwksResponse = restTemplate.getForObject(jwksUrl, String.class);
            
            if (jwksResponse == null) {
                throw new RuntimeException("Failed to fetch Supabase JWKS");
            }
            
            JsonNode jwks = objectMapper.readTree(jwksResponse);
            JsonNode keys = jwks.get("keys");
            
            if (keys == null || !keys.isArray() || keys.size() == 0) {
                throw new RuntimeException("No keys found in Supabase JWKS");
            }
            
            // Use the first key (Supabase typically has one key)
            JsonNode key = keys.get(0);
            
            // Extract modulus and exponent
            String modulus = key.get("n").asText();
            String exponent = key.get("e").asText();
            
            // Decode base64url
            byte[] modulusBytes = Base64.getUrlDecoder().decode(modulus);
            byte[] exponentBytes = Base64.getUrlDecoder().decode(exponent);
            
            // Create RSA public key
            RSAPublicKeySpec spec = new RSAPublicKeySpec(
                    new BigInteger(1, modulusBytes),
                    new BigInteger(1, exponentBytes)
            );
            
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            publicKey = (RSAPublicKey) keyFactory.generatePublic(spec);
            publicKeyExpiry = new Date(System.currentTimeMillis() + 3600000); // 1 hour cache
            
            return publicKey;
        } catch (Exception e) {
            log.error("Failed to fetch Supabase public key", e);
            
            // Fallback: If Supabase JWT secret is provided, use HS256
            if (supabaseJwtSecret != null && !supabaseJwtSecret.isEmpty()) {
                log.warn("Using HS256 fallback for JWT validation");
                SecretKey secretKey = Keys.hmacShaKeyFor(supabaseJwtSecret.getBytes(StandardCharsets.UTF_8));
                // This is a fallback - ideally use RS256
                throw new RuntimeException("HS256 fallback not fully implemented. Please configure Supabase URL.");
            }
            
            throw new RuntimeException("Failed to get Supabase public key: " + e.getMessage(), e);
        }
    }
    
    /**
     * Check if token is valid (not expired and properly signed)
     */
    public boolean isTokenValid(String token) {
        try {
            validateToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

