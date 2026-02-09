package com.creatorx.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Simple health check controller for Railway/container orchestration.
 * This provides a fast, lightweight health check that doesn't depend on
 * external services.
 */
@RestController
@Tag(name = "Health", description = "Health check endpoints")
public class HealthController {

    /**
     * Simple liveness probe - just confirms the app is running
     * Use this for Railway's health check to avoid timeout issues
     */
    @GetMapping("/health")
    @Operation(summary = "Simple health check", description = "Lightweight health check for container orchestration")
    public ResponseEntity<Map<String, Object>> simpleHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "CreatorX Backend API");
        return ResponseEntity.ok(response);
    }

    /**
     * API versioned health endpoint with more details
     */
    @GetMapping("/api/v1/health")
    @Operation(summary = "Detailed health check", description = "Returns detailed health status")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "CreatorX Backend API");
        response.put("version", "1.0.0");
        return ResponseEntity.ok(response);
    }
}
