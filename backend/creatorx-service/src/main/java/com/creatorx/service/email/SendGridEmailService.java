package com.creatorx.service.email;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

/**
 * SendGrid email service implementation
 * Requires SENDGRID_API_KEY environment variable
 * 
 * Supports:
 * - Plain text emails
 * - HTML emails
 * - SendGrid Dynamic Templates
 * - Async sending for non-blocking operations
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
            @Value("${creatorx.email.from.name:CreatorX}") String fromName) {
        this.sendGrid = new SendGrid(apiKey);
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        log.info("SendGrid email service initialized with from={}", fromEmail);
    }

    @Override
    @Async
    public void sendEmail(String to, String subject, String body) {
        Email from = new Email(fromEmail, fromName);
        Email toEmail = new Email(to);
        Content content = new Content("text/plain", body);
        Mail mail = new Mail(from, subject, toEmail, content);

        sendMail(mail, to, subject);
    }

    @Override
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        Email from = new Email(fromEmail, fromName);
        Email toEmail = new Email(to);
        Content content = new Content("text/html", htmlBody);
        Mail mail = new Mail(from, subject, toEmail, content);

        sendMail(mail, to, subject);
    }

    @Override
    @Async
    public void sendTemplatedEmail(String to, String templateId, Map<String, Object> variables) {
        Email from = new Email(fromEmail, fromName);
        Mail mail = new Mail();
        mail.setFrom(from);
        mail.setTemplateId(templateId);

        Personalization personalization = new Personalization();
        personalization.addTo(new Email(to));
        variables.forEach(personalization::addDynamicTemplateData);
        mail.addPersonalization(personalization);

        sendMail(mail, to, "template:" + templateId);
    }

    private void sendMail(Mail mail, String to, String subject) {
        try {
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sendGrid.api(request);

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("Email sent successfully to={} subject={} status={}",
                        to, subject, response.getStatusCode());
            } else {
                log.error("Failed to send email to={} subject={} status={} body={}",
                        to, subject, response.getStatusCode(), response.getBody());
            }
        } catch (IOException e) {
            log.error("Error sending email to={} subject={}: {}", to, subject, e.getMessage(), e);
        }
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
