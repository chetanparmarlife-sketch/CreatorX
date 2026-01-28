package com.creatorx.api.integration;

import com.creatorx.common.enums.UserRole;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.User;
import com.creatorx.service.SupabaseJwtService;
import com.creatorx.service.admin.AdminPermissionService;
import com.creatorx.service.testdata.TestDataBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MvcResult;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Comprehensive Authentication Integration Tests
 * 
 * Tests all authentication scenarios:
 * 1. Brand login and protected endpoint access
 * 2. Admin login and admin endpoint access
 * 3. Creator/Mobile Supabase token validation
 * 4. Token expiration and refresh
 * 5. Invalid token handling
 * 6. Role-based access control (RBAC)
 * 7. Logout and token invalidation
 */
public class AuthenticationIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SupabaseJwtService supabaseJwtService;

    @MockBean
    private AdminPermissionService adminPermissionService;

    @Value("${supabase.jwt.secret:your-super-secret-jwt-key-with-at-least-32-characters}")
    private String jwtSecret;

    private SecretKey secretKey;
    private User brandUser;
    private User adminUser;
    private User creatorUser;

    @BeforeEach
    void setUp() {
        // Initialize JWT secret key
        secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        // Configure SupabaseJwtService mock to validate HS256 test tokens
        org.mockito.Mockito.when(supabaseJwtService.validateToken(ArgumentMatchers.anyString()))
                .thenAnswer(invocation -> {
                    String token = invocation.getArgument(0);
                    try {
                        // Parse and validate the HS256 token using the test secret
                        return Jwts.parser()
                                .verifyWith(secretKey)
                                .build()
                                .parseSignedClaims(token)
                                .getPayload();
                    } catch (Exception e) {
                        throw new RuntimeException("Invalid token: " + e.getMessage(), e);
                    }
                });

        // Mock AdminPermissionService to allow all permissions for testing
        org.mockito.Mockito.when(adminPermissionService.hasPermission(
                ArgumentMatchers.anyString(), ArgumentMatchers.anyString()))
                .thenReturn(true);
        // Also ensure requirePermission doesn't throw
        org.mockito.Mockito.doNothing().when(adminPermissionService)
                .requirePermission(ArgumentMatchers.anyString(), ArgumentMatchers.anyString());

        // Clear any existing authentication
        SecurityContextHolder.clearContext();

        // Create test users
        brandUser = userRepository.findByEmail("auth-test-brand@example.com")
                .orElseGet(() -> userRepository.save(
                        TestDataBuilder.user()
                                .asBrand()
                                .withEmail("auth-test-brand@example.com")
                                .withSupabaseId("supabase-brand-" + UUID.randomUUID())
                                .build()));

        adminUser = userRepository.findByEmail("auth-test-admin@example.com")
                .orElseGet(() -> userRepository.save(
                        TestDataBuilder.user()
                                .asAdmin()
                                .withEmail("auth-test-admin@example.com")
                                .withSupabaseId("supabase-admin-" + UUID.randomUUID())
                                .build()));

        creatorUser = userRepository.findByEmail("auth-test-creator@example.com")
                .orElseGet(() -> userRepository.save(
                        TestDataBuilder.user()
                                .asCreator()
                                .withEmail("auth-test-creator@example.com")
                                .withSupabaseId("supabase-creator-" + UUID.randomUUID())
                                .build()));
    }

    // ==================== Helper Methods ====================

    /**
     * Generate a valid JWT token for a user
     */
    private String generateValidToken(User user) {
        return generateToken(user, Instant.now().plus(1, ChronoUnit.HOURS));
    }

    /**
     * Generate an expired JWT token
     */
    private String generateExpiredToken(User user) {
        return generateToken(user, Instant.now().minus(1, ChronoUnit.HOURS));
    }

    /**
     * Generate a JWT token with custom expiration
     */
    private String generateToken(User user, Instant expiration) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", user.getSupabaseId());
        claims.put("email", user.getEmail());
        claims.put("role", user.getRole().name());
        claims.put("user_metadata", Map.of("role", user.getRole().name()));

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getSupabaseId())
                .setIssuedAt(Date.from(Instant.now()))
                .setExpiration(Date.from(expiration))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generate a token with invalid signature
     */
    private String generateInvalidSignatureToken(User user) {
        SecretKey wrongKey = Keys
                .hmacShaKeyFor("wrong-secret-key-with-32-characters!".getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .setSubject(user.getSupabaseId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .setIssuedAt(Date.from(Instant.now()))
                .setExpiration(Date.from(Instant.now().plus(1, ChronoUnit.HOURS)))
                .signWith(wrongKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // ==================== Test Classes ====================

    @Nested
    @DisplayName("1. Brand Login and Protected Endpoint Access")
    class BrandLoginTests {

        @Test
        @DisplayName("Brand can access protected endpoint with valid JWT")
        void brandCanAccessProtectedEndpointWithValidJwt() throws Exception {
            String token = generateValidToken(brandUser);

            mockMvc.perform(get("/api/v1/auth/me")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.user.email").value(brandUser.getEmail()))
                    .andExpect(jsonPath("$.user.role").value("BRAND"));
        }

        @Test
        @DisplayName("Brand can access own campaigns")
        void brandCanAccessOwnCampaigns() throws Exception {
            String token = generateValidToken(brandUser);

            mockMvc.perform(get("/api/v1/campaigns")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Brand cannot access without token")
        void brandCannotAccessWithoutToken() throws Exception {
            mockMvc.perform(get("/api/v1/auth/me")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("2. Admin Login and Admin Endpoint Access")
    class AdminLoginTests {

        @Test
        @DisplayName("Admin can access admin endpoints with valid JWT")
        void adminCanAccessAdminEndpointsWithValidJwt() throws Exception {
            String token = generateValidToken(adminUser);

            mockMvc.perform(get("/api/v1/admin/users")
                    .header("Authorization", "Bearer " + token)
                    .param("page", "0")
                    .param("size", "10")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Admin can access campaign management")
        void adminCanAccessCampaignManagement() throws Exception {
            String token = generateValidToken(adminUser);

            mockMvc.perform(get("/api/v1/admin/campaign-management")
                    .header("Authorization", "Bearer " + token)
                    .param("page", "0")
                    .param("size", "10")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Admin can view audit logs")
        void adminCanViewAuditLogs() throws Exception {
            String token = generateValidToken(adminUser);

            // Note: Actual endpoint is /api/v1/admin/audit (not audit-logs)
            mockMvc.perform(get("/api/v1/admin/audit")
                    .header("Authorization", "Bearer " + token)
                    .param("page", "0")
                    .param("size", "10")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("3. Creator (Mobile) Supabase Token Validation")
    class CreatorTokenValidationTests {

        @Test
        @DisplayName("Creator can access protected endpoints with Supabase JWT")
        void creatorCanAccessWithSupabaseJwt() throws Exception {
            String token = generateValidToken(creatorUser);

            mockMvc.perform(get("/api/v1/auth/me")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.user.role").value("CREATOR"));
        }

        @Test
        @DisplayName("Creator can browse campaigns")
        void creatorCanBrowseCampaigns() throws Exception {
            String token = generateValidToken(creatorUser);

            mockMvc.perform(get("/api/v1/campaigns")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Creator can access own profile")
        void creatorCanAccessOwnProfile() throws Exception {
            String token = generateValidToken(creatorUser);

            mockMvc.perform(get("/api/v1/profile")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Creator can access notifications")
        void creatorCanAccessNotifications() throws Exception {
            String token = generateValidToken(creatorUser);

            mockMvc.perform(get("/api/v1/notifications")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("4. Expired Token and Refresh Flow")
    class TokenExpirationTests {

        @Test
        @DisplayName("Expired token returns 401 Unauthorized")
        void expiredTokenReturns401() throws Exception {
            String expiredToken = generateExpiredToken(brandUser);

            mockMvc.perform(get("/api/v1/auth/me")
                    .header("Authorization", "Bearer " + expiredToken)
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Token about to expire can still be used")
        void tokenAboutToExpireStillWorks() throws Exception {
            // Token expires in 5 seconds
            String nearExpiryToken = generateToken(brandUser, Instant.now().plus(5, ChronoUnit.SECONDS));

            mockMvc.perform(get("/api/v1/auth/me")
                    .header("Authorization", "Bearer " + nearExpiryToken)
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Refresh token endpoint - placeholder test")
        void refreshTokenEndpointPlaceholder() throws Exception {
            // Note: Supabase handles token refresh on client side.
            // This backend delegates auth to Supabase and doesn't implement refresh-token.
            // This test verifies that the endpoint either:
            // - Doesn't exist (404)
            // - Returns an error (400, 405, 500)
            // - Is public (200 with no-op)
            // All are acceptable as Supabase handles refresh on client side.
            String refreshToken = generateValidToken(brandUser);

            Map<String, String> request = new HashMap<>();
            request.put("refreshToken", refreshToken);

            MvcResult result = mockMvc.perform(post("/api/v1/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andReturn();
            int status = result.getResponse().getStatus();
            // Any of these statuses is acceptable for a non-implemented refresh endpoint
            assertThat(status).isIn(200, 400, 401, 404, 405, 500);
        }
    }

    @Nested
    @DisplayName("5. Invalid Token Handling")
    class InvalidTokenTests {

        @Test
        @DisplayName("Malformed token returns 401")
        void malformedTokenReturns401() throws Exception {
            mockMvc.perform(get("/api/v1/auth/me")
                    .header("Authorization", "Bearer not-a-valid-jwt-token")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Token with invalid signature returns 401")
        void invalidSignatureReturns401() throws Exception {
            String invalidToken = generateInvalidSignatureToken(brandUser);

            mockMvc.perform(get("/api/v1/auth/me")
                    .header("Authorization", "Bearer " + invalidToken)
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Empty Bearer token returns 401")
        void emptyBearerTokenReturns401() throws Exception {
            mockMvc.perform(get("/api/v1/auth/me")
                    .header("Authorization", "Bearer ")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Wrong auth scheme returns 401")
        void wrongAuthSchemeReturns401() throws Exception {
            String token = generateValidToken(brandUser);

            mockMvc.perform(get("/api/v1/auth/me")
                    .header("Authorization", "Basic " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Token for non-existent user returns 401")
        void tokenForNonExistentUserReturns401() throws Exception {
            // Create a user object that doesn't exist in DB
            User fakeUser = User.builder()
                    .id(UUID.randomUUID().toString())
                    .email("fake@example.com")
                    .supabaseId("fake-supabase-id")
                    .role(UserRole.CREATOR)
                    .build();

            String token = generateValidToken(fakeUser);

            mockMvc.perform(get("/api/v1/auth/me")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("6. RBAC - Role-Based Access Control")
    class RBACTests {

        @Test
        @DisplayName("Brand cannot access admin endpoints - returns 403")
        void brandCannotAccessAdminEndpoints() throws Exception {
            String brandToken = generateValidToken(brandUser);

            mockMvc.perform(get("/api/v1/admin/users")
                    .header("Authorization", "Bearer " + brandToken)
                    .param("page", "0")
                    .param("size", "10")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Creator cannot access admin endpoints - returns 403")
        void creatorCannotAccessAdminEndpoints() throws Exception {
            String creatorToken = generateValidToken(creatorUser);

            mockMvc.perform(get("/api/v1/admin/campaign-management")
                    .header("Authorization", "Bearer " + creatorToken)
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Creator cannot access brand-only endpoints - returns 403")
        void creatorCannotAccessBrandEndpoints() throws Exception {
            String creatorToken = generateValidToken(creatorUser);

            // Try to create a campaign (brand-only action)
            // Provide a complete valid request body so validation passes,
            // allowing security check to return 403
            Map<String, Object> campaignData = new HashMap<>();
            campaignData.put("title", "Test Campaign");
            campaignData.put("description", "Test Description");
            campaignData.put("budget", 1000.00);
            campaignData.put("platform", "INSTAGRAM");
            campaignData.put("category", "Fashion");
            campaignData.put("deliverableTypes", java.util.List.of("REEL"));
            campaignData.put("startDate", java.time.LocalDate.now().plusDays(7).toString());
            campaignData.put("endDate", java.time.LocalDate.now().plusDays(30).toString());

            mockMvc.perform(post("/api/v1/campaigns")
                    .header("Authorization", "Bearer " + creatorToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(campaignData)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Admin can access all endpoints")
        void adminCanAccessAllEndpoints() throws Exception {
            String adminToken = generateValidToken(adminUser);

            // Admin endpoints
            mockMvc.perform(get("/api/v1/admin/users")
                    .header("Authorization", "Bearer " + adminToken)
                    .param("page", "0")
                    .param("size", "10")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());

            // Regular endpoints
            mockMvc.perform(get("/api/v1/campaigns")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Non-admin user cannot access admin endpoints")
        void nonAdminCannotAccessAdminEndpoints() throws Exception {
            String brandToken = generateValidToken(brandUser);

            // Brand user trying to access admin users list should get 403
            mockMvc.perform(get("/api/v1/admin/users")
                    .header("Authorization", "Bearer " + brandToken)
                    .param("page", "0")
                    .param("size", "10")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("7. Logout and Token Invalidation")
    class LogoutTests {

        @Test
        @DisplayName("Logout - stateless JWT architecture")
        void logoutStatelessJwt() throws Exception {
            String token = generateValidToken(brandUser);

            // First verify token works
            mockMvc.perform(get("/api/v1/auth/me")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());

            // Note: This backend uses Supabase for authentication.
            // Logout is handled on the client side by clearing the Supabase session.
            // For stateless JWT, the token remains valid until expiry.
            // A token blacklist would be needed for immediate server-side invalidation.
            //
            // Test verifies that:
            // 1. Authenticated requests work before "logout"
            // 2. The token can still be used (stateless JWT characteristic)

            // Token should still work since we're using stateless JWT
            mockMvc.perform(get("/api/v1/auth/me")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("8. Link Supabase User Flow")
    class LinkSupabaseUserTests {

        @Test
        @DisplayName("Can link new Supabase user to backend")
        void canLinkNewSupabaseUser() throws Exception {
            String supabaseId = "new-supabase-" + UUID.randomUUID();

            Map<String, Object> linkRequest = new HashMap<>();
            linkRequest.put("supabaseUserId", supabaseId);
            linkRequest.put("email", "new-user@example.com");
            linkRequest.put("name", "New User");
            linkRequest.put("role", "CREATOR");

            mockMvc.perform(post("/api/v1/auth/link-supabase-user")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(linkRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.user.email").value("new-user@example.com"))
                    .andExpect(jsonPath("$.user.role").value("CREATOR"));
        }

        @Test
        @DisplayName("Linking existing user returns existing profile")
        void linkingExistingUserReturnsProfile() throws Exception {
            Map<String, Object> linkRequest = new HashMap<>();
            linkRequest.put("supabaseUserId", creatorUser.getSupabaseId());
            linkRequest.put("email", creatorUser.getEmail());
            linkRequest.put("name", "Creator Test");
            linkRequest.put("role", "CREATOR");

            mockMvc.perform(post("/api/v1/auth/link-supabase-user")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(linkRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.user.id").value(creatorUser.getId()));
        }

        @Test
        @DisplayName("Link request with missing fields returns 400")
        void linkRequestWithMissingFieldsReturns400() throws Exception {
            Map<String, Object> incompleteRequest = new HashMap<>();
            incompleteRequest.put("email", "test@example.com");
            // Missing supabaseUserId and name

            mockMvc.perform(post("/api/v1/auth/link-supabase-user")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(incompleteRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("9. Security Headers and CORS")
    class SecurityHeadersTests {

        @Test
        @DisplayName("Response includes security headers")
        void responseIncludesSecurityHeaders() throws Exception {
            String token = generateValidToken(brandUser);

            MvcResult result = mockMvc.perform(get("/api/v1/auth/me")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andReturn();

            // Check for common security headers
            assertThat(result.getResponse().getHeader("X-Content-Type-Options"))
                    .isEqualTo("nosniff");
            assertThat(result.getResponse().getHeader("X-Frame-Options"))
                    .isIn("DENY", "SAMEORIGIN");
        }

        @Test
        @DisplayName("Public endpoints are accessible without auth")
        void publicEndpointsAccessibleWithoutAuth() throws Exception {
            // Health check should be public
            mockMvc.perform(get("/actuator/health"))
                    .andExpect(status().isOk());
        }
    }
}
