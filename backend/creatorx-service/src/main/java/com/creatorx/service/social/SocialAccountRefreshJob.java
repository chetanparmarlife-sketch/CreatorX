package com.creatorx.service.social;

import com.creatorx.service.SocialAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SocialAccountRefreshJob {
    private final SocialAccountService socialAccountService;

    @Scheduled(cron = "${creatorx.social.refresh.cron:0 30 2 * * *}")
    public void refreshNightly() {
        int refreshed = socialAccountService.refreshEligibleAccounts();
        log.info("Nightly social refresh completed, refreshed {}", refreshed);
    }
}
