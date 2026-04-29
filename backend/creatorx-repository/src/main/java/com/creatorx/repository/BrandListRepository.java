package com.creatorx.repository;

import com.creatorx.repository.entity.BrandList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * BrandListRepository.
 *
 * Provides database access for brand-owned creator lists while always scoping
 * reads by brand ID so one brand cannot access another brand's shortlist.
 */
@Repository
public interface BrandListRepository extends JpaRepository<BrandList, String> {
    @Query("SELECT bl FROM BrandList bl WHERE bl.brand.id = :brandId ORDER BY bl.createdAt DESC")
    List<BrandList> findByBrandIdOrderByCreatedAtDesc(@Param("brandId") String brandId);

    @Query("SELECT bl FROM BrandList bl WHERE bl.brand.id = :brandId AND bl.campaign.id = :campaignId ORDER BY bl.createdAt DESC")
    List<BrandList> findByBrandIdAndCampaignIdOrderByCreatedAtDesc(
            @Param("brandId") String brandId,
            @Param("campaignId") String campaignId);

    @Query("SELECT bl FROM BrandList bl WHERE bl.brand.id = :brandId AND bl.campaign IS NULL ORDER BY bl.createdAt DESC")
    List<BrandList> findByBrandIdAndCampaignIdIsNullOrderByCreatedAtDesc(@Param("brandId") String brandId);

    @Query("SELECT bl FROM BrandList bl WHERE bl.id = :listId AND bl.brand.id = :brandId")
    Optional<BrandList> findByIdAndBrandId(@Param("listId") String listId, @Param("brandId") String brandId);
}
