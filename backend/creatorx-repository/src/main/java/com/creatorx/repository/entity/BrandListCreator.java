package com.creatorx.repository.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * BrandListCreator entity.
 *
 * Stores one creator inside a BrandList. The database unique constraint keeps
 * shortlist adds idempotent by preventing duplicate creator entries.
 */
@Entity
@Table(name = "brand_list_creators", indexes = {
        @Index(name = "idx_brand_list_creators_list_id", columnList = "list_id"),
        @Index(name = "idx_brand_list_creators_creator_id", columnList = "creator_id")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uq_brand_list_creator", columnNames = {"list_id", "creator_id"})
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"list", "addedBy"})
public class BrandListCreator extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", nullable = false)
    private BrandList list;

    @Column(name = "creator_id", nullable = false)
    private String creatorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by")
    private User addedBy;

    @CreationTimestamp
    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;
}
