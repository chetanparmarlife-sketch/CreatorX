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

    boolean existsByCampaignIdAndRuleIdAndStatus(String campaignId, String ruleId, CampaignFlagStatus status);

    long countByStatus(CampaignFlagStatus status);
}
