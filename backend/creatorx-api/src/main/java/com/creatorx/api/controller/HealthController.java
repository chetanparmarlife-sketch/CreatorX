package com.creatorx.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.CompositeHealth;
import org.springframework.boot.actuate.health.HealthComponent;
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
        HealthComponent healthComponent = healthEndpoint.health();
        Map<String, Object> response = new HashMap<>();
        response.put("status", healthComponent.getStatus().getCode());
        
        // Extract component details if available
        if (healthComponent instanceof CompositeHealth compositeHealth) {
            Map<String, String> components = new HashMap<>();
            compositeHealth.getComponents().forEach((name, component) -> 
                components.put(name, component.getStatus().getCode()));
            response.put("components", components);
        }
        
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "CreatorX Backend API");
        return ResponseEntity.ok(response);
    }
}



