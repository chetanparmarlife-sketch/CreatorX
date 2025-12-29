package com.creatorx.api.security;

import com.creatorx.common.util.Constants;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.User;
import com.creatorx.service.SupabaseJwtService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collections;

/**
 * JWT authentication interceptor for WebSocket connections
 * Validates JWT token from STOMP CONNECT frame
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {
    
    private final SupabaseJwtService supabaseJwtService;
    private final UserRepository userRepository;
    
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Extract token from headers
            String token = extractToken(accessor);
            
            if (token != null) {
                try {
                    // Validate token
                    Claims claims = supabaseJwtService.validateToken(token);
                    String supabaseUserId = claims.getSubject();
                    
                    if (supabaseUserId == null) {
                        log.warn("JWT token missing 'sub' claim in WebSocket connection");
                        return null; // Reject connection
                    }
                    
                    // Load user from database
                    User user = userRepository.findBySupabaseId(supabaseUserId)
                            .orElse(null);
                    
                    if (user == null) {
                        log.warn("User not found for Supabase ID: {}", supabaseUserId);
                        return null; // Reject connection
                    }
                    
                    // Check if user is active
                    if (user.getStatus() != com.creatorx.common.enums.UserStatus.ACTIVE) {
                        log.warn("User is not active: {}", user.getId());
                        return null; // Reject connection
                    }
                    
                    // Set authentication
                    String role = user.getRole().name();
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                    );
                    
                    accessor.setUser(authentication);
                    log.debug("WebSocket connection authenticated for user: {}", user.getEmail());
                    
                } catch (Exception e) {
                    log.error("JWT validation failed for WebSocket connection", e);
                    return null; // Reject connection
                }
            } else {
                log.warn("No JWT token found in WebSocket CONNECT frame");
                return null; // Reject connection
            }
        }
        
        return message;
    }
    
    /**
     * Extract JWT token from STOMP headers
     * Token can be in:
     * 1. Authorization header (Bearer token)
     * 2. Custom header (token)
     */
    private String extractToken(StompHeaderAccessor accessor) {
        // Try Authorization header first
        String authHeader = accessor.getFirstNativeHeader(Constants.AUTH_HEADER);
        if (authHeader != null && authHeader.startsWith(Constants.BEARER_PREFIX)) {
            return authHeader.substring(Constants.BEARER_PREFIX.length());
        }
        
        // Try custom token header
        String token = accessor.getFirstNativeHeader("token");
        if (token != null) {
            return token;
        }
        
        return null;
    }
}

