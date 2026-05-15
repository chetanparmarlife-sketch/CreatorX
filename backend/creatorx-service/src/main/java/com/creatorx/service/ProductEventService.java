package com.creatorx.service;

import com.creatorx.repository.ProductEventRepository;
import com.creatorx.repository.entity.ProductEvent;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductEventService {
    private static final int MAX_EVENT_NAME_LENGTH = 120;
    private static final int MAX_ACTOR_TYPE_LENGTH = 40;
    private static final int MAX_ACTOR_ID_LENGTH = 80;
    private static final int MAX_SOURCE_LENGTH = 80;

    private final ProductEventRepository productEventRepository;
    private final ObjectMapper objectMapper;
    private final MeterRegistry meterRegistry;

    @Transactional
    public int ingest(List<Map<String, Object>> rawEvents, String userAgent) {
        List<ProductEvent> events = new ArrayList<>();
        for (Map<String, Object> rawEvent : rawEvents == null ? List.<Map<String, Object>>of() : rawEvents) {
            ProductEvent event = toProductEvent(rawEvent, userAgent);
            if (event != null) {
                events.add(event);
            }
        }

        if (events.isEmpty()) {
            return 0;
        }

        productEventRepository.saveAll(events);
        for (ProductEvent event : events) {
            Counter.builder("creatorx.product.events.ingested")
                    .description("Product telemetry events ingested")
                    .tag("event", event.getEventName())
                    .tag("source", event.getSource() != null ? event.getSource() : "unknown")
                    .register(meterRegistry)
                    .increment();
        }
        return events.size();
    }

    private ProductEvent toProductEvent(Map<String, Object> rawEvent, String userAgent) {
        if (rawEvent == null || rawEvent.isEmpty()) {
            return null;
        }

        String eventName = truncate(stringValue(rawEvent.get("event")), MAX_EVENT_NAME_LENGTH);
        if (eventName == null || eventName.isBlank()) {
            return null;
        }

        Map<String, Object> properties = new HashMap<>();
        Object rawProperties = rawEvent.get("properties");
        if (rawProperties instanceof Map<?, ?> map) {
            properties.putAll(objectMapper.convertValue(map, new TypeReference<Map<String, Object>>() {
            }));
        }
        rawEvent.forEach((key, value) -> {
            if (!"properties".equals(key) && !"event".equals(key)) {
                properties.putIfAbsent(key, value);
            }
        });

        String brandId = stringValue(rawEvent.get("brand_id"));
        String adminId = stringValue(rawEvent.get("admin_id"));
        String creatorId = stringValue(rawEvent.get("creator_id"));
        String actorType = brandId != null ? "brand" : adminId != null ? "admin" : creatorId != null ? "creator" : null;
        String actorId = brandId != null ? brandId : adminId != null ? adminId : creatorId;

        return ProductEvent.builder()
                .eventName(eventName)
                .actorType(truncate(actorType, MAX_ACTOR_TYPE_LENGTH))
                .actorId(truncate(actorId, MAX_ACTOR_ID_LENGTH))
                .route(stringValue(rawEvent.get("route")))
                .source(truncate(sourceFor(rawEvent, actorType), MAX_SOURCE_LENGTH))
                .sentAt(parseDateTime(stringValue(rawEvent.get("sent_at"))))
                .occurredAt(LocalDateTime.now())
                .userAgent(userAgent)
                .propertiesJson(properties)
                .build();
    }

    private String sourceFor(Map<String, Object> rawEvent, String actorType) {
        String source = stringValue(rawEvent.get("source"));
        if (source != null && !source.isBlank()) {
            return source;
        }
        if (actorType == null) {
            return "unknown";
        }
        return actorType.toLowerCase(Locale.ROOT) + "_dashboard";
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return OffsetDateTime.parse(value).toLocalDateTime();
        } catch (DateTimeParseException ignored) {
            try {
                return LocalDateTime.parse(value);
            } catch (DateTimeParseException ignoredAgain) {
                return null;
            }
        }
    }

    private String stringValue(Object value) {
        if (value == null) {
            return null;
        }
        String string = String.valueOf(value).trim();
        return string.isEmpty() ? null : string;
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
