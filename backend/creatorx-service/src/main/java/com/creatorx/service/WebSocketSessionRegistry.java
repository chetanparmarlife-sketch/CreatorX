package com.creatorx.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Registry for tracking WebSocket session connections.
 * Used to determine if a user is currently online (connected via WebSocket)
 * to optimize push notification delivery.
 *
 * When a user is online (has active WebSocket connection), they receive
 * real-time notifications via WebSocket, so push notifications are skipped.
 */
@Component
@Slf4j
public class WebSocketSessionRegistry {

    // Map of userId -> Set of session IDs (a user can have multiple sessions/devices)
    private final Map<String, Set<String>> userSessions = new ConcurrentHashMap<>();

    // Map of sessionId -> userId for reverse lookup
    private final Map<String, String> sessionToUser = new ConcurrentHashMap<>();

    /**
     * Register a WebSocket session for a user
     *
     * @param userId    The user's ID
     * @param sessionId The WebSocket session ID
     */
    public void registerSession(String userId, String sessionId) {
        if (userId == null || sessionId == null) {
            log.warn("Cannot register session with null userId or sessionId");
            return;
        }

        userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(sessionId);
        sessionToUser.put(sessionId, userId);

        log.debug("WebSocket session registered: userId={}, sessionId={}, totalSessions={}",
                userId, sessionId, userSessions.get(userId).size());
    }

    /**
     * Unregister a WebSocket session
     *
     * @param sessionId The WebSocket session ID to remove
     */
    public void unregisterSession(String sessionId) {
        if (sessionId == null) {
            return;
        }

        String userId = sessionToUser.remove(sessionId);
        if (userId != null) {
            Set<String> sessions = userSessions.get(userId);
            if (sessions != null) {
                sessions.remove(sessionId);
                if (sessions.isEmpty()) {
                    userSessions.remove(userId);
                    log.debug("User went offline: userId={}", userId);
                } else {
                    log.debug("WebSocket session removed: userId={}, sessionId={}, remainingSessions={}",
                            userId, sessionId, sessions.size());
                }
            }
        }
    }

    /**
     * Check if a user is currently online (has at least one active WebSocket connection)
     *
     * @param userId The user's ID
     * @return true if the user has an active WebSocket connection
     */
    public boolean isUserOnline(String userId) {
        if (userId == null) {
            return false;
        }

        Set<String> sessions = userSessions.get(userId);
        boolean online = sessions != null && !sessions.isEmpty();

        log.trace("Online status check: userId={}, online={}, sessions={}",
                userId, online, sessions != null ? sessions.size() : 0);

        return online;
    }

    /**
     * Get the number of active sessions for a user
     *
     * @param userId The user's ID
     * @return Number of active WebSocket sessions
     */
    public int getSessionCount(String userId) {
        if (userId == null) {
            return 0;
        }

        Set<String> sessions = userSessions.get(userId);
        return sessions != null ? sessions.size() : 0;
    }

    /**
     * Get total number of online users
     *
     * @return Count of users with at least one active session
     */
    public int getOnlineUserCount() {
        return userSessions.size();
    }

    /**
     * Get total number of active sessions
     *
     * @return Count of all active WebSocket sessions
     */
    public int getTotalSessionCount() {
        return sessionToUser.size();
    }
}
