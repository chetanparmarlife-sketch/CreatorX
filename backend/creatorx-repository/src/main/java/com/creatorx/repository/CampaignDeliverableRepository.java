package com.creatorx.repository;

import com.creatorx.repository.entity.CampaignDeliverable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignDeliverableRepository extends JpaRepository<CampaignDeliverable, String> {
    
    @Query("SELECT cd FROM CampaignDeliverable cd WHERE cd.campaign.id = :campaignId ORDER BY cd.orderIndex ASC")
    List<CampaignDeliverable> findByCampaignId(@Param("campaignId") String campaignId);
}

