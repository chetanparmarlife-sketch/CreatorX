package com.creatorx.api.scheduler;

import com.creatorx.api.controller.WebhookController;
import com.creatorx.repository.WebhookEventRepository;
import com.creatorx.repository.entity.WebhookEvent;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Scheduled job for retrying failed webhook event processing.
 *
 * Finds webhook events with status=FAILED and retryCount < maxRetries,
 * re-parses the stored payload, and reprocesses them through the same
 * handler pipeline used by WebhookController.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebhookRetryScheduler {

    private final WebhookEventRepository webhookEventRepository;
    private final WebhookController webhookController;
    private final ObjectMapper objectMapper;

    @Value("${creatorx.webhook.retry.enabled:true}")
    private boolean enabled;

    @Value("${creatorx.webhook.retry.max-retries:3}")
    private int maxRetries;

    @Scheduled(cron = "${creatorx.webhook.retry.cron:0 */15 * * * *}")
    public void retryFailedWebhooks() {
        if (!enabled) {
            log.debug("Webhook retry scheduler is disabled");
            return;
        }

        log.info("Starting webhook retry scheduler");
        long startTime = System.currentTimeMillis();

        List<WebhookEvent> failedEvents = webhookEventRepository.findFailedForRetry(maxRetries);

        if (failedEvents.isEmpty()) {
            log.debug("No failed webhooks to retry");
            return;
        }

        int retried = 0;
        int succeeded = 0;
        int failed = 0;

        for (WebhookEvent event : failedEvents) {
            try {
                retryEvent(event);
                succeeded++;
            } catch (Exception e) {
                log.error("Retry failed for webhook {}: {}", event.getWebhookId(), e.getMessage());
                failed++;
            }
            retried++;
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("Webhook retry scheduler done: retried={}, succeeded={}, failed={}, duration={}ms",
                retried, succeeded, failed, duration);
    }

    @Transactional
    protected void retryEvent(WebhookEvent event) {
        try {
            JsonNode payload = objectMapper.readTree(event.getPayload());
            webhookController.processWebhookEvent(event.getEventType(), payload);

            event.setStatus("PROCESSED");
            event.setErrorMessage(null);
            event.setRetryCount(event.getRetryCount() + 1);
            webhookEventRepository.save(event);

            log.info("Webhook {} retry succeeded (attempt {})", event.getWebhookId(), event.getRetryCount());
        } catch (Exception e) {
            event.setRetryCount(event.getRetryCount() + 1);
            event.setErrorMessage(e.getMessage());
            webhookEventRepository.save(event);

            log.warn("Webhook {} retry failed (attempt {}/{}): {}",
                    event.getWebhookId(), event.getRetryCount(), maxRetries, e.getMessage());
        }
    }
}
