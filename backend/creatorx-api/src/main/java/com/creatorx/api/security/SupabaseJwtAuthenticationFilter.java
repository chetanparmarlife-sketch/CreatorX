/**
 * JWT Authentication Filter for Supabase tokens
 * Validates Supabase JWT tokens and loads user from database
 */

package com.creatorx.api.security;

import com.creatorx.common.util.Constants;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.User;
import com.creatorx.service.JwtService;
import com.creatorx.service.SupabaseJwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class SupabaseJwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final SupabaseJwtService supabaseJwtService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String token = getTokenFromRequest(request);
        
        if (StringUtils.hasText(token)) {
            try {
                // Validate Supabase JWT token
                Claims claims = supabaseJwtService.validateToken(token);

                // Extract user ID from token (Supabase uses 'sub' claim)
                String supabaseUserId = claims.getSubject();
                if (supabaseUserId == null) {
                    log.debug("JWT token missing 'sub' claim");
                    filterChain.doFilter(request, response);
                    return;
                }

                // Find user by Supabase ID
                User user = userRepository.findBySupabaseId(supabaseUserId)
                        .orElse(null);

                if (user == null) {
                    log.debug("User not found for Supabase ID: {}", supabaseUserId);
                    filterChain.doFilter(request, response);
                    return;
                }

                // Check if user is active
                if (user.getStatus() != com.creatorx.common.enums.UserStatus.ACTIVE) {
                    log.debug("User is not active: {}", user.getId());
                    filterChain.doFilter(request, response);
                    return;
                }

                setAuthentication(user, request);
                log.debug("Authenticated user: {} with role: {}", user.getEmail(), user.getRole());
            } catch (Exception e) {
                log.debug("Supabase JWT token validation failed: {}", e.getMessage());
                // Fallback: validate internal JWT (admin direct login)
                try {
                    String email = jwtService.extractUsername(token);
                    if (email == null || email.isBlank()) {
                        filterChain.doFilter(request, response);
                        return;
                    }

                    User user = userRepository.findByEmail(email).orElse(null);
                    if (user == null) {
                        filterChain.doFilter(request, response);
                        return;
                    }

                    if (!jwtService.validateToken(token, email)) {
                        filterChain.doFilter(request, response);
                        return;
                    }

                    if (user.getStatus() != com.creatorx.common.enums.UserStatus.ACTIVE) {
                        filterChain.doFilter(request, response);
                        return;
                    }

                    setAuthentication(user, request);
                    log.debug("Authenticated user via internal JWT: {} with role: {}", user.getEmail(), user.getRole());
                } catch (Exception ex) {
                    log.debug("Internal JWT validation failed: {}", ex.getMessage());
                    // Continue filter chain without authentication - let Spring Security handle authorization
                }
            }
        }
        
        filterChain.doFilter(request, response);
    }

    private void setAuthentication(User user, HttpServletRequest request) {
        String role = user.getRole().name();
        UserAuthenticationToken authentication = new UserAuthenticationToken(
                user,
                java.util.Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
        );
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
    
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(Constants.AUTH_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(Constants.BEARER_PREFIX)) {
            return bearerToken.substring(Constants.BEARER_PREFIX.length());
        }
        return null;
    }
}

