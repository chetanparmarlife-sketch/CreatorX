/**
 * JWT Authentication Filter for Supabase tokens
 * Validates Supabase JWT tokens and loads user from database
 */

package com.creatorx.api.security;

import com.creatorx.common.util.Constants;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.User;
import com.creatorx.service.SupabaseJwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Slf4j
@Component
@RequiredArgsConstructor
public class SupabaseJwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final SupabaseJwtService supabaseJwtService;
    private final UserRepository userRepository;
    
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
                
                // Create authentication object
                String role = user.getRole().name();
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Set authentication in security context
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                log.debug("Authenticated user: {} with role: {}", user.getEmail(), role);
                
            } catch (Exception e) {
                log.debug("Supabase JWT token validation failed: {}", e.getMessage());
                // Continue filter chain without authentication - let Spring Security handle authorization
            }
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(Constants.AUTH_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(Constants.BEARER_PREFIX)) {
            return bearerToken.substring(Constants.BEARER_PREFIX.length());
        }
        return null;
    }
}

