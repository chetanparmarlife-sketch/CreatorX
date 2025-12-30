package com.creatorx.repository;

import com.creatorx.repository.entity.CampaignTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CampaignTemplateRepository extends JpaRepository<CampaignTemplate, String> {
    List<CampaignTemplate> findByBrandId(String brandId);
}
