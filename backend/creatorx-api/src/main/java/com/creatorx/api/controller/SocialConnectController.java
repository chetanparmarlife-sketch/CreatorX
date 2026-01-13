package com.creatorx.api.controller;

import com.creatorx.common.enums.SocialProvider;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.service.SocialAccountService;
import com.creatorx.service.social.SocialOAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

/**
 * OAuth connect endpoints for social providers.
 * Mobile opens /start URL and receives deep link callback.
 * Tokens are stored server-side only (encrypted).
 */
@RestController
@RequestMapping("/api/v1/social/connect")
@Tag(name = "Social Connect", description = "OAuth connection flow for social providers")
@RequiredArgsConstructor
@Slf4j
public class SocialConnectController {

    private final SocialOAuthService socialOAuthService;
    private final SocialAccountService socialAccountService;

    @Value("${creatorx.mobile.deep-link-scheme:creatorx}")
    private String deepLinkScheme;

    private static final String SESSION_OAUTH_STATE = "oauth_state";
    private static final String SESSION_USER_ID = "oauth_user_id";
    private static final String SESSION_PROVIDER = "oauth_provider";

    /**
     * Start OAuth flow for a provider.
     * Returns 302 redirect to provider's authorization page.
     */
    @GetMapping("/{provider}/start")
    @Operation(summary = "Start OAuth flow", description = "Redirects to provider authorization page")
    public ResponseEntity<Void> startOAuth(
            @PathVariable String provider,
            Authentication authentication,
            HttpSession session
    ) {
        SocialProvider socialProvider = resolveProvider(provider);

        // LinkedIn returns 501 Not Implemented
        if (socialProvider == SocialProvider.LINKEDIN) {
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                    .header("X-Error-Code", "SOCIAL_LINKEDIN_NOT_AVAILABLE")
                    .header("X-Error-Message", "LinkedIn integration coming soon")
                    .build();
        }

        // Check if provider is configured
        if (!socialOAuthService.isProviderEnabled(socialProvider)) {
            throw new BusinessException("Provider not configured", "SOCIAL_CONFIG_MISSING");
        }

        // Generate state parameter for CSRF protection
        String state = UUID.randomUUID().toString();

        // Store state and user info in session for callback validation
        String userId = authentication.getName();
        session.setAttribute(SESSION_OAUTH_STATE, state);
        session.setAttribute(SESSION_USER_ID, userId);
        session.setAttribute(SESSION_PROVIDER, socialProvider.name());

        // Get authorization URL
        String authUrl = socialOAuthService.getAuthorizationUrl(socialProvider, state);

        log.info("Starting OAuth flow for provider {} user {}", socialProvider, userId);

        // Redirect to provider authorization page
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(authUrl))
                .build();
    }

    /**
     * OAuth callback from provider.
     * Exchanges code for token, stores encrypted, redirects to mobile deep link.
     */
    @GetMapping("/{provider}/callback")
    @Operation(summary = "OAuth callback", description = "Handles provider callback and redirects to mobile")
    public ResponseEntity<Void> oauthCallback(
            @PathVariable String provider,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            @RequestParam(name = "error_description", required = false) String errorDescription,
            HttpSession session
    ) {
        SocialProvider socialProvider = resolveProvider(provider);

        // Handle error from provider
        if (error != null) {
            log.warn("OAuth error from {}: {} - {}", provider, error, errorDescription);
            return redirectToMobile(socialProvider, false, errorDescription != null ? errorDescription : error);
        }

        // Validate state parameter
        String storedState = (String) session.getAttribute(SESSION_OAUTH_STATE);
        if (storedState == null || !storedState.equals(state)) {
            log.warn("OAuth state mismatch for {}", provider);
            return redirectToMobile(socialProvider, false, "Invalid OAuth state");
        }

        // Get user ID from session
        String userId = (String) session.getAttribute(SESSION_USER_ID);
        if (userId == null) {
            log.warn("No user ID in session for {} callback", provider);
            return redirectToMobile(socialProvider, false, "Session expired");
        }

        // Validate provider matches
        String storedProvider = (String) session.getAttribute(SESSION_PROVIDER);
        if (!socialProvider.name().equals(storedProvider)) {
            log.warn("OAuth provider mismatch: expected {} got {}", storedProvider, socialProvider);
            return redirectToMobile(socialProvider, false, "Provider mismatch");
        }

        // Clear session OAuth data
        session.removeAttribute(SESSION_OAUTH_STATE);
        session.removeAttribute(SESSION_USER_ID);
        session.removeAttribute(SESSION_PROVIDER);

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

    /**
     * Build mobile deep link redirect for callback result.
     */
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
