package com.creatorx.repository;

import com.creatorx.common.enums.ApplicationStatus;
import com.creatorx.repository.entity.CampaignApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampaignApplicationRepository extends JpaRepository<CampaignApplication, String> {
    Optional<CampaignApplication> findByCampaignIdAndCreatorId(String campaignId, String creatorId);
    List<CampaignApplication> findByCampaignId(String campaignId);
    Page<CampaignApplication> findByCreatorId(String creatorId, Pageable pageable);
    Page<CampaignApplication> findByCampaignIdAndStatus(String campaignId, ApplicationStatus status, Pageable pageable);
    boolean existsByCampaignIdAndCreatorId(String campaignId, String creatorId);
}




