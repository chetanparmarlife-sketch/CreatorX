package com.creatorx.repository.entity;

import com.creatorx.common.enums.AdminActionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.Builder;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.net.InetAddress;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "admin_actions", indexes = {
    @Index(name = "idx_admin_id", columnList = "admin_id"),
    @Index(name = "idx_action_type", columnList = "action_type"),
    @Index(name = "idx_entity", columnList = "entity_type,entity_id"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "admin")
public class AdminAction extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private AdminActionType actionType;
    
    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;
    
    @Column(name = "entity_id")
    private String entityId;
    
    @Column(name = "details_json", columnDefinition = "JSONB")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private Map<String, Object> detailsJson = new HashMap<>();
    
    @Column(name = "ip_address")
    private InetAddress ipAddress;
    
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;
}

