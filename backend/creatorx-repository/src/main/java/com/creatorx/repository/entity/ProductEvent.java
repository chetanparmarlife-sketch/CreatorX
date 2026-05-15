package com.creatorx.repository.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "product_events", indexes = {
        @Index(name = "idx_product_events_event_name", columnList = "event_name"),
        @Index(name = "idx_product_events_actor", columnList = "actor_type,actor_id"),
        @Index(name = "idx_product_events_route", columnList = "route"),
        @Index(name = "idx_product_events_occurred_at", columnList = "occurred_at")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ProductEvent extends BaseEntity {
    @Column(name = "event_name", nullable = false, length = 120)
    private String eventName;

    @Column(name = "actor_type", length = 40)
    private String actorType;

    @Column(name = "actor_id", length = 80)
    private String actorId;

    @Column(name = "route", columnDefinition = "TEXT")
    private String route;

    @Column(name = "source", length = 80)
    private String source;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "properties_json", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> propertiesJson = new HashMap<>();
}
