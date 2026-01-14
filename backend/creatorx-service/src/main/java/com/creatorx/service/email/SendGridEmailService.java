package com.creatorx.service.email;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

/**
 * SendGrid email service implementation
 * Requires SENDGRID_API_KEY environment variable
 */
@Service
@ConditionalOnProperty(name = "creatorx.email.enabled", havingValue = "true")
@Slf4j
public class SendGridEmailService implements EmailService {
    
    private final SendGrid sendGrid;
    private final String fromEmail;
    private final String fromName;
    
    public SendGridEmailService(
            @Value("${creatorx.email.sendgrid.api-key}") String apiKey,
            @Value("${creatorx.email.from.email:noreply@creatorx.com}") String fromEmail,
            @Value("${creatorx.email.from.name:CreatorX}") String fromName
    ) {
        this.sendGrid = new SendGrid(apiKey);
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        log.info("SendGrid email service initialized with from={}", fromEmail);
    }
    
    @Override
    public void sendEmail(String to, String subject, String body) {
        Email from = new Email(fromEmail, fromName);
        Email toEmail = new Email(to);
        Content content = new Content("text/plain", body);
        Mail mail = new Mail(from, subject, toEmail, content);
        
        try {
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sendGrid.api(request);
            
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("Email sent successfully to={} subject={}", to, subject);
            } else {
                log.error("Failed to send email to={} status={} body={}", 
                        to, response.getStatusCode(), response.getBody());
            }
        } catch (IOException e) {
            log.error("Error sending email to={}: {}", to, e.getMessage(), e);
        }
    }
    
    @Override
    public void sendTemplatedEmail(String to, String templateId, Map<String, String> variables) {
        Email from = new Email(fromEmail, fromName);
        Mail mail = new Mail();
        mail.setFrom(from);
        mail.setTemplateId(templateId);
        
        Personalization personalization = new Personalization();
        personalization.addTo(new Email(to));
        variables.forEach(personalization::addDynamicTemplateData);
        mail.addPersonalization(personalization);
        
        try {
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sendGrid.api(request);
            
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("Templated email sent successfully to={} templateId={}", to, templateId);
            } else {
                log.error("Failed to send templated email to={} status={} body={}", 
                        to, response.getStatusCode(), response.getBody());
            }
        } catch (IOException e) {
            log.error("Error sending templated email to={}: {}", to, e.getMessage(), e);
        }
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
}
