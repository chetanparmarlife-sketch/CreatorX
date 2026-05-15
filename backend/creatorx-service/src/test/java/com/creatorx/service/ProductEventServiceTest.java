package com.creatorx.service;

import com.creatorx.repository.ProductEventRepository;
import com.creatorx.repository.entity.ProductEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductEventService Unit Tests")
class ProductEventServiceTest {

    @Mock
    private ProductEventRepository productEventRepository;

    @Test
    @DisplayName("Should persist brand event with merged telemetry properties")
    void ingest_persistsBrandEvent() {
        ProductEventService service = new ProductEventService(
                productEventRepository,
                new ObjectMapper(),
                new SimpleMeterRegistry()
        );

        int ingested = service.ingest(List.of(Map.of(
                "event", "workspace_viewed",
                "brand_id", "brand-1",
                "route", "/dashboard",
                "wallet_balance_band", "healthy",
                "properties", Map.of("pending_deliverables_count", 2)
        )), "JUnit");

        ArgumentCaptor<List<ProductEvent>> captor = ArgumentCaptor.forClass(List.class);
        verify(productEventRepository).saveAll(captor.capture());

        ProductEvent event = captor.getValue().get(0);
        assertThat(ingested).isEqualTo(1);
        assertThat(event.getEventName()).isEqualTo("workspace_viewed");
        assertThat(event.getActorType()).isEqualTo("brand");
        assertThat(event.getActorId()).isEqualTo("brand-1");
        assertThat(event.getRoute()).isEqualTo("/dashboard");
        assertThat(event.getSource()).isEqualTo("brand_dashboard");
        assertThat(event.getUserAgent()).isEqualTo("JUnit");
        assertThat(event.getPropertiesJson())
                .containsEntry("wallet_balance_band", "healthy")
                .containsEntry("pending_deliverables_count", 2);
    }

    @Test
    @DisplayName("Should skip malformed events without event name")
    void ingest_skipsMalformedEvents() {
        ProductEventService service = new ProductEventService(
                productEventRepository,
                new ObjectMapper(),
                new SimpleMeterRegistry()
        );

        int ingested = service.ingest(List.of(Map.of("brand_id", "brand-1")), "JUnit");

        assertThat(ingested).isZero();
    }
}
