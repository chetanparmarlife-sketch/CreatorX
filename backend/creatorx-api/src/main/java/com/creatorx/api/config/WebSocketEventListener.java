package com.creatorx.api.config;

import com.creatorx.service.WebSocketSessionRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

/**
 * Listener for WebSocket session events.
 * Tracks user connections to determine online status for
 * optimizing push notification delivery.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final WebSocketSessionRegistry sessionRegistry;

    /**
     * Handle WebSocket connection event
     */
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        Principal user = headerAccessor.getUser();

        if (user != null && sessionId != null) {
            String userId = user.getName();
            sessionRegistry.registerSession(userId, sessionId);
            log.info("WebSocket connected: userId={}, sessionId={}", userId, sessionId);
        } else {
            log.debug("WebSocket connected without user principal: sessionId={}", sessionId);
        }
    }

    /**
     * Handle WebSocket disconnection event
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        Principal user = headerAccessor.getUser();

        if (sessionId != null) {
            sessionRegistry.unregisterSession(sessionId);
            String userId = user != null ? user.getName() : "unknown";
            log.info("WebSocket disconnected: userId={}, sessionId={}", userId, sessionId);
        }
    }
}
