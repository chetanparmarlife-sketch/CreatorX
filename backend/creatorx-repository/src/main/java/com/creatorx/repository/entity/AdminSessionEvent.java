package com.creatorx.repository.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_session_events", indexes = {
    @Index(name = "idx_admin_session_events_admin_id", columnList = "admin_id"),
    @Index(name = "idx_admin_session_events_occurred_at", columnList = "occurred_at")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "admin")
public class AdminSessionEvent extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Column(name = "event_type", nullable = false, length = 40)
    private String eventType;

    @Column(name = "path", columnDefinition = "TEXT")
    private String path;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;
}
