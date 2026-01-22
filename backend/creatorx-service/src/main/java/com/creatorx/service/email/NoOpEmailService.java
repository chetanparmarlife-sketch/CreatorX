package com.creatorx.service.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * No-op email service for development/testing
 * Used when EMAIL_ENABLED=false
 */
@Service
@ConditionalOnProperty(name = "creatorx.email.enabled", havingValue = "false", matchIfMissing = true)
@Slf4j
public class NoOpEmailService implements EmailService {

    public NoOpEmailService() {
        log.info("NoOpEmailService initialized - emails will be logged but not sent");
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        log.info("[NO-OP EMAIL] to={} subject={} body={}", to, subject, truncate(body));
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        log.info("[NO-OP HTML EMAIL] to={} subject={} htmlLength={}", to, subject, htmlBody.length());
    }

    @Override
    public void sendTemplatedEmail(String to, String templateId, Map<String, Object> variables) {
        log.info("[NO-OP TEMPLATE EMAIL] to={} templateId={} variables={}", to, templateId, variables);
    }

    @Override
    public boolean isEnabled() {
        return false;
    }

    private String truncate(String text) {
        return text.length() > 100 ? text.substring(0, 100) + "..." : text;
    }
}
