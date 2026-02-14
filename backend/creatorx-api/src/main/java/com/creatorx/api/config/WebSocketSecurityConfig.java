package com.creatorx.api.config;

import com.creatorx.api.security.JwtChannelInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket security configuration
 * Registers JWT authentication interceptor
 */
@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@RequiredArgsConstructor
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {
    
    private final JwtChannelInterceptor jwtChannelInterceptor;
    
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Register JWT interceptor to authenticate WebSocket connections
        registration.interceptors(jwtChannelInterceptor);
    }
}

