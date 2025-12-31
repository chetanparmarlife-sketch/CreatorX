package com.creatorx.repository;

import com.creatorx.common.enums.CampaignFlagStatus;
import com.creatorx.repository.entity.CampaignFlag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CampaignFlagRepository extends JpaRepository<CampaignFlag, String> {
    @Query("SELECT f FROM CampaignFlag f WHERE f.status = :status ORDER BY f.createdAt DESC")
    Page<CampaignFlag> findByStatus(@Param("status") CampaignFlagStatus status, Pageable pageable);

    @Query("SELECT COUNT(f) FROM CampaignFlag f WHERE f.campaign.brand.id = :brandId AND f.status = :status")
    long countByBrandIdAndStatus(@Param("brandId") String brandId, @Param("status") CampaignFlagStatus status);

    boolean existsByCampaignIdAndRuleIdAndStatus(String campaignId, String ruleId, CampaignFlagStatus status);

    long countByRuleId(String ruleId);

    long countByRuleIdAndStatus(String ruleId, CampaignFlagStatus status);

    CampaignFlag findTopByRuleIdOrderByCreatedAtDesc(String ruleId);

    long countByStatus(CampaignFlagStatus status);
}
