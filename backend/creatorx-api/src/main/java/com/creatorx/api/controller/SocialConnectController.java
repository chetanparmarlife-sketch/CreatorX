package com.creatorx.api.controller;

import com.creatorx.common.enums.SocialProvider;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.repository.entity.User;
import com.creatorx.service.SocialAccountService;
import com.creatorx.service.social.SocialOAuthService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.crypto.SecretKey;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * OAuth connect endpoints for social providers.
 * Mobile opens /start URL and receives deep link callback.
 * Tokens are stored server-side only (encrypted).
 *
 * Uses stateless OAuth: the OAuth state parameter carries a signed JWT
 * containing the user ID and provider, eliminating the need for HTTP sessions.
 * The /callback endpoint is public (no auth required) since the provider
 * redirects via browser GET without an Authorization header.
 */
@RestController
@RequestMapping("/api/v1/social/connect")
@Tag(name = "Social Connect", description = "OAuth connection flow for social providers")
@Slf4j
public class SocialConnectController {

    private final SocialOAuthService socialOAuthService;
    private final SocialAccountService socialAccountService;
    private final String deepLinkScheme;
    private final SecretKey stateSigningKey;

    /** OAuth state token validity — 15 minutes is enough for an OAuth round-trip */
    private static final long STATE_TOKEN_VALIDITY_MS = 15 * 60 * 1000;

    public SocialConnectController(
            SocialOAuthService socialOAuthService,
            SocialAccountService socialAccountService,
            @Value("${creatorx.mobile.deep-link-scheme:creatorx}") String deepLinkScheme,
            @Value("${creatorx.social.token-secret:change-this-in-production-minimum-32-characters}") String socialTokenSecret
    ) {
        this.socialOAuthService = socialOAuthService;
        this.socialAccountService = socialAccountService;
        this.deepLinkScheme = deepLinkScheme;
        this.stateSigningKey = Keys.hmacShaKeyFor(socialTokenSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Start OAuth flow for a provider.
     * Requires authentication (JWT). Returns 302 redirect to provider's
     * authorization page with a signed state token.
     */
    @GetMapping("/{provider}/start")
    @Operation(summary = "Start OAuth flow", description = "Redirects to provider authorization page")
    public ResponseEntity<Void> startOAuth(
            @PathVariable String provider,
            Authentication authentication
    ) {
        SocialProvider socialProvider = resolveProvider(provider);

        if (socialProvider == SocialProvider.LINKEDIN) {
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                    .header("X-Error-Code", "SOCIAL_LINKEDIN_NOT_AVAILABLE")
                    .header("X-Error-Message", "LinkedIn integration coming soon")
                    .build();
        }

        if (!socialOAuthService.isProviderEnabled(socialProvider)) {
            throw new BusinessException("Provider not configured", "SOCIAL_CONFIG_MISSING");
        }

        // Extract user ID from the JWT-authenticated principal
        User user = (User) authentication.getPrincipal();
        String userId = user.getId();

        // Build a signed state token carrying userId + provider + nonce
        String stateToken = createOAuthStateToken(userId, socialProvider);

        // Pass the signed token as the OAuth state parameter
        String authUrl = socialOAuthService.getAuthorizationUrl(socialProvider, stateToken);

        log.info("Starting OAuth flow: provider={}, user={}", socialProvider, userId);

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(authUrl))
                .build();
    }

    /**
     * OAuth callback from provider.
     * This endpoint is public (permitAll) because the provider redirects here
     * via browser GET with no Authorization header. The user identity is
     * recovered from the signed state token.
     */
    @GetMapping("/{provider}/callback")
    @Operation(summary = "OAuth callback", description = "Handles provider callback and redirects to mobile")
    public ResponseEntity<Void> oauthCallback(
            @PathVariable String provider,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            @RequestParam(name = "error_description", required = false) String errorDescription
    ) {
        SocialProvider socialProvider = resolveProvider(provider);

        // Handle error from provider
        if (error != null) {
            log.warn("OAuth error from {}: {} - {}", provider, error, errorDescription);
            return redirectToMobile(socialProvider, false, errorDescription != null ? errorDescription : error);
        }

        // Parse and validate the signed state token
        OAuthState oauthState;
        try {
            oauthState = parseOAuthStateToken(state);
        } catch (Exception e) {
            log.warn("Invalid OAuth state token for {}: {}", provider, e.getMessage());
            return redirectToMobile(socialProvider, false, "Invalid or expired OAuth state");
        }

        // Validate provider matches what was requested
        if (oauthState.provider != socialProvider) {
            log.warn("OAuth provider mismatch: state has {} but callback is for {}", oauthState.provider, socialProvider);
            return redirectToMobile(socialProvider, false, "Provider mismatch");
        }

        String userId = oauthState.userId;

        try {
            // Exchange code for token
            SocialOAuthService.OAuthTokenResult tokenResult = socialOAuthService.exchangeCodeForToken(socialProvider, code);

            // Store tokens encrypted (never returned to client)
            socialAccountService.connectSocialAccount(
                    userId,
                    socialProvider,
                    tokenResult.accessToken(),
                    tokenResult.refreshToken(),
                    tokenResult.expiresAt()
            );

            log.info("Successfully connected {} for user {}", socialProvider, userId);
            return redirectToMobile(socialProvider, true, null);

        } catch (BusinessException e) {
            log.error("Failed to connect {} for user {}: {}", socialProvider, userId, e.getMessage());
            return redirectToMobile(socialProvider, false, e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error connecting {} for user {}", socialProvider, userId, e);
            return redirectToMobile(socialProvider, false, "Connection failed");
        }
    }

    // --- OAuth state token helpers (stateless CSRF protection) ---

    /**
     * Create a short-lived signed JWT carrying the OAuth flow context.
     * This replaces HttpSession for state management.
     */
    private String createOAuthStateToken(String userId, SocialProvider provider) {
        return Jwts.builder()
                .subject(userId)
                .claim("provider", provider.name())
                .claim("nonce", UUID.randomUUID().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + STATE_TOKEN_VALIDITY_MS))
                .signWith(stateSigningKey)
                .compact();
    }

    /**
     * Parse and validate a state token returned from the OAuth provider redirect.
     * Verifies signature, expiry, and extracts userId + provider.
     */
    private OAuthState parseOAuthStateToken(String stateToken) {
        if (stateToken == null || stateToken.isBlank()) {
            throw new JwtException("Missing state token");
        }

        Claims claims = Jwts.parser()
                .verifyWith(stateSigningKey)
                .build()
                .parseSignedClaims(stateToken)
                .getPayload();

        String userId = claims.getSubject();
        SocialProvider provider = SocialProvider.valueOf(claims.get("provider", String.class));

        return new OAuthState(userId, provider);
    }

    private record OAuthState(String userId, SocialProvider provider) {}

    // --- Helpers ---

    private ResponseEntity<Void> redirectToMobile(SocialProvider provider, boolean success, String errorMessage) {
        StringBuilder deepLink = new StringBuilder()
                .append(deepLinkScheme)
                .append("://social-connect?provider=")
                .append(provider.name().toLowerCase())
                .append("&status=")
                .append(success ? "success" : "error");

        if (!success && errorMessage != null) {
            deepLink.append("&message=").append(encodeParam(errorMessage));
        }

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(deepLink.toString()))
                .build();
    }

    private SocialProvider resolveProvider(String raw) {
        try {
            return SocialProvider.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Unsupported provider: " + raw, "SOCIAL_PROVIDER_INVALID");
        }
    }

    private String encodeParam(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
}
