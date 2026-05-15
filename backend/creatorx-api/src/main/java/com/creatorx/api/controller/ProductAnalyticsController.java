package com.creatorx.api.controller;

import com.creatorx.api.dto.ProductEventIngestionResponse;
import com.creatorx.service.ProductEventService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Product Analytics", description = "Product telemetry ingestion endpoints")
public class ProductAnalyticsController {
    private final ProductEventService productEventService;
    private final ObjectMapper objectMapper;
    private static final TypeReference<List<Map<String, Object>>> EVENT_LIST_TYPE = new TypeReference<>() {
    };
    private static final TypeReference<Map<String, Object>> EVENT_TYPE = new TypeReference<>() {
    };

    @PostMapping("/events")
    @Operation(summary = "Ingest product events", description = "Accepts a product event or event batch from dashboards.")
    public ResponseEntity<ProductEventIngestionResponse> ingestEvents(
            @RequestBody JsonNode payload,
            HttpServletRequest request
    ) {
        List<Map<String, Object>> events = toEvents(payload);
        int ingested = productEventService.ingest(events, request.getHeader("User-Agent"));
        return ResponseEntity.accepted().body(ProductEventIngestionResponse.builder()
                .accepted(true)
                .ingested(ingested)
                .build());
    }

    private List<Map<String, Object>> toEvents(JsonNode payload) {
        if (payload == null || payload.isNull()) {
            return List.of();
        }
        if (payload.isArray()) {
            return objectMapper.convertValue(payload, EVENT_LIST_TYPE);
        }
        return List.of(objectMapper.convertValue(payload, EVENT_TYPE));
    }
}
