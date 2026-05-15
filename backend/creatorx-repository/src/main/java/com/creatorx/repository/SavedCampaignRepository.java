package com.creatorx.repository;

import com.creatorx.repository.entity.SavedCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface SavedCampaignRepository extends JpaRepository<SavedCampaign, String> {
    Optional<SavedCampaign> findByCreatorIdAndCampaignId(String creatorId, String campaignId);
    boolean existsByCreatorIdAndCampaignId(String creatorId, String campaignId);
    
    @Query("SELECT sc.campaign FROM SavedCampaign sc WHERE sc.creator.id = :creatorId ORDER BY sc.createdAt DESC")
    List<com.creatorx.repository.entity.Campaign> findCampaignsByCreatorId(@Param("creatorId") String creatorId);

    @Query("SELECT sc.campaign.id FROM SavedCampaign sc WHERE sc.creator.id = :creatorId AND sc.campaign.id IN :campaignIds")
    List<String> findSavedCampaignIds(
            @Param("creatorId") String creatorId,
            @Param("campaignIds") Collection<String> campaignIds);
    
    void deleteByCreatorIdAndCampaignId(String creatorId, String campaignId);
}
