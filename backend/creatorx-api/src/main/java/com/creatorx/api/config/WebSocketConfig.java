package com.creatorx.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration for real-time messaging
 * Uses STOMP over WebSocket protocol
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * WebSocket origin restriction.
     *
     * Previously allowed ALL origins ("*") which meant any website could
     * connect to our chat server. Now restricted to only our own frontend URLs.
     *
     * Set ALLOWED_ORIGINS env var as comma-separated list:
     *   e.g. https://creatorx-brand.vercel.app,https://creatorx-admin.vercel.app,http://localhost:3000
     */
    @Value("${websocket.allowed-origins:http://localhost:3000,http://localhost:3001}")
    private String allowedOriginsConfig;
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple in-memory message broker to carry messages back to the client
        // on destinations prefixed with "/topic" and "/user"
        config.enableSimpleBroker("/topic", "/queue");
        
        // Prefix for messages that are bound to @MessageMapping methods
        config.setApplicationDestinationPrefixes("/app");
        
        // Prefix for user-specific destinations
        config.setUserDestinationPrefix("/user");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] origins = allowedOriginsConfig.split("\\s*,\\s*");

        // Register the "/ws" endpoint, enabling SockJS fallback options
        // SockJS allows fallback to alternative transports if WebSocket is not available
        registry.addEndpoint("/ws")
                // Old wildcard origin policy allowed any website to open chat connections; use configured frontend origins only.
                .setAllowedOrigins(origins)
                .withSockJS();
        
        // Also register without SockJS for native WebSocket clients
        registry.addEndpoint("/ws")
                // Native WebSocket clients must follow the same configured origin allowlist.
                .setAllowedOrigins(origins);
    }
}
