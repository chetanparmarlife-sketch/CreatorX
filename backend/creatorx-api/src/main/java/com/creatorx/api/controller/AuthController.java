/**
 * Authentication controller for Supabase Auth integration
 */

package com.creatorx.api.controller;

import com.creatorx.api.dto.AuthResponse;
import com.creatorx.api.dto.ForgotPasswordRequest;
import com.creatorx.api.dto.LinkSupabaseUserRequest;
import com.creatorx.api.dto.RefreshTokenRequest;
import com.creatorx.api.dto.RegisterRequest;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.repository.entity.User;
import com.creatorx.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Authentication endpoints for Supabase integration")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @org.springframework.beans.factory.annotation.Value("${creatorx.webhook.internal-secret:}")
    private String webhookInternalSecret;

    /**
     * Register a new user.
     * In production, registration happens on client via Supabase SDK.
     * This endpoint is used for admin user creation or webhook callbacks.
     */
    @PostMapping("/register")
    @Operation(summary = "Register user", description = "Create user profile in Spring Boot (Supabase registration happens on client)")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.registerUser(
                request.getEmail(),
                request.getPassword(),
                request.getRole(),
                request.getName(),
                request.getPhone());

        return ResponseEntity.ok(AuthResponse.builder()
                .user(toAuthUserInfo(user))
                .message("User registered. Please complete Supabase registration on client.")
                .build());
    }

    /**
     * Link Supabase user to internal user.
     * Called after Supabase registration or via webhook.
     * For brands, also creates brand profile if companyName is provided.
     */
    @PostMapping("/link-supabase-user")
    @Operation(summary = "Link Supabase user", description = "Link Supabase user ID to internal user profile")
    public ResponseEntity<AuthResponse> linkSupabaseUser(
            @Valid @RequestBody LinkSupabaseUserRequest request,
            @RequestHeader(value = "X-Webhook-Secret", required = false) String webhookSecret) {

        // Dual-path auth: webhook secret OR authenticated self-link
        boolean isWebhook = webhookInternalSecret != null
                && !webhookInternalSecret.isBlank()
                && webhookInternalSecret.equals(webhookSecret);

        if (!isWebhook) {
            // Self-link path: require JWT auth and verify caller's email matches request
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()
                    || auth.getPrincipal().equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        AuthResponse.builder().message("Authentication required").build());
            }
            User caller = (User) auth.getPrincipal();
            if (!caller.getEmail().equalsIgnoreCase(request.getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                        AuthResponse.builder().message("You can only link your own account").build());
            }
        }

        User user = authService.linkSupabaseUser(
                request.getSupabaseUserId(),
                request.getEmail(),
                request.getName(),
                request.getRole(),
                request.getCompanyName(),
                request.getIndustry(),
                request.getWebsite());

        return ResponseEntity.ok(AuthResponse.builder()
                .user(toAuthUserInfo(user))
                .message("User linked successfully")
                .build());
    }

    /**
     * Login with email and password.
     * Supports direct login for users with password_hash set (e.g., admin, test
     * users).
     * For Supabase-managed accounts, redirect to Supabase auth.
     */
    @PostMapping("/login")
    @Operation(summary = "Login", description = "Login with email and password. Works for admin/test users with password set.")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody com.creatorx.api.dto.LoginRequest request) {
        try {
            log.info("Login attempt for email: {}", request.getEmail());

            AuthService.LoginResult result = authService.loginWithPassword(
                    request.getEmail(),
                    request.getPassword());

            log.info("Login successful for email: {}, role: {}", request.getEmail(), result.getUser().getRole());

            // For backwards compatibility with admin dashboard expecting "token" and "expiresIn"
            AuthResponse response = AuthResponse.builder()
                    .accessToken(result.getAccessToken())
                    .refreshToken(result.getRefreshToken())
                    .user(toAuthUserInfo(result.getUser()))
                    .message("Login successful")
                    .build();

            // Also add "token" field for admin dashboard (24 hour expiry)
            response.setToken(result.getAccessToken());
            response.setExpiresIn(86400); // 24 hours in seconds

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed for email: {} - Error: {}", request.getEmail(), e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Get current user profile.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user", description = "Get authenticated user profile")
    public ResponseEntity<AuthResponse> getCurrentUser() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(AuthResponse.builder()
                .user(toAuthUserInfo(user))
                .build());
    }

    /**
     * Refresh access token via Supabase.
     */
    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh token", description = "Refresh access token using Supabase refresh token")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthService.TokenPair tokens = authService.refreshToken(request.getRefreshToken());

        // Build response with backwards compatibility
        AuthResponse response = AuthResponse.builder()
                .accessToken(tokens.getAccessToken())
                .refreshToken(tokens.getRefreshToken())
                .message("Token refreshed successfully")
                .build();

        // Also add "token" and "expiresIn" for admin dashboard
        response.setToken(tokens.getAccessToken());
        response.setExpiresIn(86400); // 24 hours in seconds

        return ResponseEntity.ok(response);
    }

    /**
     * Logout (server-side session invalidation).
     * Client should also call Supabase signOut.
     */
    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Logout", description = "Invalidate server-side session")
    public ResponseEntity<AuthResponse> logout() {
        User user = getAuthenticatedUser();
        authService.logout(user.getSupabaseId());
        return ResponseEntity.ok(AuthResponse.builder()
                .message("Logged out successfully")
                .build());
    }

    /**
     * Request password reset email via Supabase.
     */
    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot password", description = "Send password reset email via Supabase")
    public ResponseEntity<AuthResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(AuthResponse.builder()
                .message("Password reset email sent. Check your inbox.")
                .build());
    }

    /**
     * Update email verification status.
     * Called via Supabase webhook when email is verified.
     */
    @PostMapping("/verify-email")
    @Operation(summary = "Verify email", description = "Update email verification status (called via webhook)")
    public ResponseEntity<Void> verifyEmail(@RequestParam String supabaseUserId) {
        authService.updateEmailVerification(supabaseUserId, true);
        return ResponseEntity.ok().build();
    }

    /**
     * Update phone verification status.
     */
    @PostMapping("/verify-phone")
    @Operation(summary = "Verify phone", description = "Update phone verification status")
    public ResponseEntity<Void> verifyPhone(@RequestParam String supabaseUserId) {
        authService.updatePhoneVerification(supabaseUserId, true);
        return ResponseEntity.ok().build();
    }

    // --- Helpers ---

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    private AuthResponse.AuthUserInfo toAuthUserInfo(User user) {
        return AuthResponse.AuthUserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .supabaseUserId(user.getSupabaseId())
                .emailVerified(user.getEmailVerified())
                .phoneVerified(user.getPhoneVerified())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }
}
