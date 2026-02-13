package com.creatorx.service.scheduler;

import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.service.BrandWalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Scheduled job for auto-completing expired campaigns and refunding unused escrow funds.
 *
 * Finds ACTIVE campaigns whose endDate has passed, transitions them to COMPLETED,
 * and refunds any remaining escrow balance back to the brand wallet.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CampaignCompletionScheduler {

    private final CampaignRepository campaignRepository;
    private final BrandWalletService brandWalletService;

    @Value("${creatorx.campaign.completion.enabled:true}")
    private boolean enabled;

    @Scheduled(cron = "${creatorx.campaign.completion.cron:0 0 1 * * *}")
    public void completeExpiredCampaigns() {
        if (!enabled) {
            log.debug("Campaign completion scheduler is disabled");
            return;
        }

        log.info("Starting campaign completion scheduler");
        long startTime = System.currentTimeMillis();

        List<Campaign> expiredCampaigns = campaignRepository
                .findByStatusAndEndDateBefore(CampaignStatus.ACTIVE, LocalDate.now());

        if (expiredCampaigns.isEmpty()) {
            log.debug("No expired campaigns to process");
            return;
        }

        int completed = 0;
        int refunded = 0;
        int failed = 0;

        for (Campaign campaign : expiredCampaigns) {
            try {
                completeCampaign(campaign);
                completed++;

                // Refund unused escrow funds if any were allocated
                if (campaign.getEscrowAllocated() != null
                        && campaign.getEscrowAllocated().compareTo(java.math.BigDecimal.ZERO) > 0) {
                    brandWalletService.refundUnusedCampaignFunds(campaign.getId());
                    refunded++;
                }
            } catch (Exception e) {
                log.error("Failed to complete campaign {}: {}", campaign.getId(), e.getMessage(), e);
                failed++;
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("Campaign completion scheduler done: completed={}, refunded={}, failed={}, duration={}ms",
                completed, refunded, failed, duration);
    }

    @Transactional
    protected void completeCampaign(Campaign campaign) {
        campaign.setStatus(CampaignStatus.COMPLETED);
        campaignRepository.save(campaign);
        log.info("Auto-completed campaign: id={}, title={}, endDate={}",
                campaign.getId(), campaign.getTitle(), campaign.getEndDate());
    }
}
