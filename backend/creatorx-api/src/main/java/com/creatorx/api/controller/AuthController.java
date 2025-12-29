/**
 * Authentication controller for Supabase Auth integration
 */

package com.creatorx.api.controller;

import com.creatorx.api.dto.AuthResponse;
import com.creatorx.api.dto.LinkSupabaseUserRequest;
import com.creatorx.api.dto.RegisterRequest;
import com.creatorx.common.enums.UserRole;
import com.creatorx.repository.entity.User;
import com.creatorx.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Authentication endpoints for Supabase integration")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    /**
     * Register a new user
     * Note: In production, registration happens on client via Supabase SDK
     * This endpoint can be used for admin user creation or webhook callbacks
     */
    @PostMapping("/register")
    @Operation(summary = "Register user", description = "Create user profile in Spring Boot (Supabase registration happens on client)")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.registerUser(
                request.getEmail(),
                request.getPassword(), // Not used, Supabase handles passwords
                request.getRole(),
                request.getName(),
                request.getPhone()
        );
        
        AuthResponse response = AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .message("User registered. Please complete Supabase registration on client.")
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Link Supabase user to internal user
     * Called after Supabase registration or via webhook
     * For brands, also creates brand profile if companyName is provided
     */
    @PostMapping("/link-supabase-user")
    @Operation(summary = "Link Supabase user", description = "Link Supabase user ID to internal user profile")
    public ResponseEntity<AuthResponse> linkSupabaseUser(@Valid @RequestBody LinkSupabaseUserRequest request) {
        User user = authService.linkSupabaseUser(
                request.getSupabaseUserId(),
                request.getEmail(),
                request.getName(),
                request.getRole(),
                request.getCompanyName(),
                request.getIndustry(),
                request.getWebsite()
        );
        
        AuthResponse response = AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .supabaseUserId(user.getSupabaseId())
                .message("User linked successfully")
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Login with email and password
     * Note: This is a fallback endpoint. Primary auth should use Supabase.
     * Returns tokens if Supabase is not available (for development/testing).
     */
    @PostMapping("/login")
    @Operation(summary = "Login", description = "Login with email and password. Note: Supabase auth is preferred.")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody com.creatorx.api.dto.LoginRequest request) {
        // For now, this endpoint indicates Supabase is required
        // In production, you could implement direct JWT generation here if needed
        throw new com.creatorx.common.exception.BusinessException(
            "Direct login not supported. Please use Supabase authentication. " +
            "If Supabase is not available, contact administrator."
        );
    }
    
    /**
     * Get current user profile
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user", description = "Get authenticated user profile")
    public ResponseEntity<AuthResponse> getCurrentUser() {
        org.springframework.security.core.Authentication authentication = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        AuthResponse response = AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .supabaseUserId(user.getSupabaseId())
                .emailVerified(user.getEmailVerified())
                .phoneVerified(user.getPhoneVerified())
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update email verification status
     * Called via Supabase webhook when email is verified
     */
    @PostMapping("/verify-email")
    @Operation(summary = "Verify email", description = "Update email verification status (called via webhook)")
    public ResponseEntity<Void> verifyEmail(@RequestParam String supabaseUserId) {
        authService.updateEmailVerification(supabaseUserId, true);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Update phone verification status
     */
    @PostMapping("/verify-phone")
    @Operation(summary = "Verify phone", description = "Update phone verification status")
    public ResponseEntity<Void> verifyPhone(@RequestParam String supabaseUserId) {
        authService.updatePhoneVerification(supabaseUserId, true);
        return ResponseEntity.ok().build();
    }
}

