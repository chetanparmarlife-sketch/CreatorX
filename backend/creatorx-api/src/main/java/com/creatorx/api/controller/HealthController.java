package com.creatorx.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health", description = "Health check endpoints")
@RequiredArgsConstructor
public class HealthController {
    private final HealthEndpoint healthEndpoint;
    
    @GetMapping
    @Operation(summary = "Health check", description = "Returns the health status of the application")
    public ResponseEntity<Map<String, Object>> health() {
        Health health = healthEndpoint.health();
        Map<String, Object> response = new HashMap<>();
        response.put("status", health.getStatus().getCode());
        response.put("components", health.getDetails());
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "CreatorX Backend API");
        return ResponseEntity.ok(response);
    }
}



