package com.creatorx.repository.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "admin_permissions", indexes = {
    @Index(name = "idx_admin_permissions_admin_id", columnList = "admin_id"),
    @Index(name = "idx_admin_permissions_permission", columnList = "permission")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "admin")
public class AdminPermission extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Column(nullable = false, length = 120)
    private String permission;
}
