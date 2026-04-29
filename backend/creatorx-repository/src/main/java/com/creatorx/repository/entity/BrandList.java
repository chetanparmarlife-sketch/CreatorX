package com.creatorx.repository.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

/**
 * BrandList entity.
 *
 * Stores a named creator list owned by a brand and optionally linked to a
 * campaign. This replaces browser localStorage shortlists so brand teams can
 * share the same saved creators across devices.
 */
@Entity
@Table(name = "brand_lists", indexes = {
        @Index(name = "idx_brand_lists_brand_id", columnList = "brand_id"),
        @Index(name = "idx_brand_lists_campaign_id", columnList = "campaign_id")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"brand", "campaign", "createdBy", "creators"})
public class BrandList extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private User brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;

    @Builder.Default
    @Column(nullable = false)
    private String name = "Shortlist";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "list", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private List<BrandListCreator> creators = new ArrayList<>();
}
