package com.creatorx.api.config;

import com.creatorx.api.security.IdempotencyFilter;
import com.creatorx.api.security.RateLimitFilter;
import com.creatorx.api.security.SupabaseJwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Security configuration with:
 * - CORS configuration
 * - JWT authentication (Supabase)
 * - Rate limiting (Redis-based, optional)
 * - Idempotency for payment operations
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final SupabaseJwtAuthenticationFilter supabaseJwtAuthenticationFilter;
    private final IdempotencyFilter idempotencyFilter;
    private final Optional<RateLimitFilter> rateLimitFilter;

    @Value("${creatorx.cors.allowed-origins:}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/v1/webhooks/**").permitAll()
                        // Public auth endpoints (login, register, password reset)
                        // Note: link-supabase-user, verify-email, verify-phone are permitAll
                        // at Spring Security level but protected by X-Webhook-Secret in controller
                        .requestMatchers(
                                "/api/v1/auth/login",
                                "/api/v1/auth/register",
                                "/api/v1/auth/reset-password",
                                "/api/v1/auth/forgot-password",
                                "/api/v1/auth/otp/**",
                                "/api/v1/auth/link-supabase-user",
                                "/api/v1/auth/verify-email",
                                "/api/v1/auth/verify-phone",
                                "/api/v1/auth/refresh-token")
                        .permitAll()
                        // OAuth callback is public — provider redirects via browser GET
                        // without Authorization header; user identity comes from signed state token
                        .requestMatchers(HttpMethod.GET, "/api/v1/social/connect/*/callback").permitAll()
                        // Other public endpoints
                        .requestMatchers(
                                "/api/v1/health",
                                "/actuator/health",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-ui.html",
                                "/error")
                        .permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(exceptions -> exceptions
                        // Return 401 for unauthenticated requests (not 403)
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                        }));

        // Add rate limit filter if Redis is available
        if (rateLimitFilter.isPresent()) {
            http.addFilterBefore(rateLimitFilter.get(), UsernamePasswordAuthenticationFilter.class);
            http.addFilterAfter(supabaseJwtAuthenticationFilter, RateLimitFilter.class);
        } else {
            // Without rate limiting, add JWT filter directly
            http.addFilterBefore(supabaseJwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        }

        http.addFilterAfter(idempotencyFilter, SupabaseJwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> basePatterns = Arrays.asList(
                "http://localhost:8081", // Expo default
                "http://localhost:19006", // Expo web
                "exp://localhost:8081",
                "http://localhost:3000",
                "https://creator-x.club",
                "https://www.creator-x.club",
                "https://brand-creatorx.vercel.app",
                "https://admin-dashboard-*.vercel.app");
        List<String> extraOrigins = parseAllowedOrigins(allowedOrigins);
        List<String> allPatterns = new ArrayList<>(basePatterns);
        allPatterns.addAll(extraOrigins);
        configuration.setAllowedOriginPatterns(allPatterns);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Idempotency-Key",
                "Idempotent-Key",
                "X-Razorpay-Signature",
                "X-Webhook-Secret"));
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-RateLimit-Limit",
                "X-RateLimit-Remaining",
                "X-RateLimit-Reset",
                "Retry-After"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration webhookConfiguration = new CorsConfiguration(configuration);
        webhookConfiguration.setAllowedMethods(Collections.singletonList("POST"));
        webhookConfiguration.setAllowedHeaders(Arrays.asList("X-Razorpay-Signature", "Content-Type"));
        source.registerCorsConfiguration("/api/v1/webhooks/razorpay", webhookConfiguration);
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private List<String> parseAllowedOrigins(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .collect(Collectors.toList());
    }
}
