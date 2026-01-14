package com.creatorx.service.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * No-operation email service for when email is disabled
 * Logs email attempts without sending
 */
@Service
@ConditionalOnProperty(name = "creatorx.email.enabled", havingValue = "false", matchIfMissing = true)
@Slf4j
public class NoOpEmailService implements EmailService {
    
    @Override
    public void sendEmail(String to, String subject, String body) {
        log.info("[EMAIL DISABLED] Would send email to={} subject={}", to, subject);
        log.debug("[EMAIL DISABLED] Body: {}", body);
    }
    
    @Override
    public void sendTemplatedEmail(String to, String templateId, Map<String, String> variables) {
        log.info("[EMAIL DISABLED] Would send templated email to={} templateId={} vars={}", 
                to, templateId, variables.keySet());
    }
    
    @Override
    public boolean isEnabled() {
        return false;
    }
}
