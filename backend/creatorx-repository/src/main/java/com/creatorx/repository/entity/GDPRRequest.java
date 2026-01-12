package com.creatorx.repository.entity;

import com.creatorx.common.enums.GDPRRequestStatus;
import com.creatorx.common.enums.GDPRRequestType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.Builder;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "gdpr_requests", indexes = {
    @Index(name = "idx_gdpr_requests_user_id", columnList = "user_id"),
    @Index(name = "idx_gdpr_requests_status", columnList = "status"),
    @Index(name = "idx_gdpr_requests_type", columnList = "request_type"),
    @Index(name = "idx_gdpr_requests_created_at", columnList = "created_at")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"user", "resolvedBy"})
public class GDPRRequest extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false)
    private GDPRRequestType requestType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GDPRRequestStatus status = GDPRRequestStatus.PENDING;

    @Column(name = "details_json", columnDefinition = "JSONB")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private Map<String, Object> detailsJson = new HashMap<>();

    @Column(name = "export_url", columnDefinition = "TEXT")
    private String exportUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
