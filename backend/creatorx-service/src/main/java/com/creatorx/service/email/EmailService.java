package com.creatorx.service.email;

import java.util.Map;

/**
 * Email service interface for sending business emails
 * Implementations: SendGridEmailService, NoOpEmailService
 * 
 * Email Types:
 * 1. KYC approval/rejection
 * 2. Campaign application status
 * 3. Deliverable approval/revision
 * 4. Withdrawal processed
 * 5. Password reset
 * 6. Welcome email
 */
public interface EmailService {

    /**
     * Send a simple text email
     */
    void sendEmail(String to, String subject, String body);

    /**
     * Send an HTML email
     */
    void sendHtmlEmail(String to, String subject, String htmlBody);

    /**
     * Send a templated email with variables (SendGrid Dynamic Templates)
     */
    void sendTemplatedEmail(String to, String templateId, Map<String, Object> variables);

    /**
     * Check if email service is enabled
     */
    boolean isEnabled();

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. WELCOME EMAIL
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Send welcome email to new user
     */
    default void sendWelcomeEmail(String to, String userName, String userRole) {
        String subject = "Welcome to CreatorX! 🎉";
        String html = EmailTemplates.welcome(userName, userRole);
        sendHtmlEmail(to, subject, html);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. KYC EMAILS
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Send KYC submitted confirmation
     */
    default void sendKycSubmittedEmail(String to, String userName, String documentType) {
        String subject = "KYC Documents Received - CreatorX";
        String html = EmailTemplates.kycSubmitted(userName, documentType);
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Send KYC approved notification email
     */
    default void sendKycApprovedEmail(String to, String userName) {
        String subject = "KYC Verification Approved! ✅ - CreatorX";
        String html = EmailTemplates.kycApproved(userName);
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Send KYC rejected notification email
     */
    default void sendKycRejectedEmail(String to, String userName, String reason) {
        String subject = "KYC Verification Update - CreatorX";
        String html = EmailTemplates.kycRejected(userName, reason);
        sendHtmlEmail(to, subject, html);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 3. CAMPAIGN APPLICATION EMAILS
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Send application submitted confirmation to creator
     */
    default void sendApplicationSubmittedEmail(String to, String userName, String campaignTitle, String brandName) {
        String subject = "Application Submitted - " + campaignTitle;
        String html = EmailTemplates.applicationSubmitted(userName, campaignTitle, brandName);
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Send application approved notification
     */
    default void sendApplicationApprovedEmail(String to, String userName, String campaignTitle, String brandName,
            String amount) {
        String subject = "🎉 You've been selected for " + campaignTitle;
        String html = EmailTemplates.applicationApproved(userName, campaignTitle, brandName, amount);
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Send application rejected notification
     */
    default void sendApplicationRejectedEmail(String to, String userName, String campaignTitle, String brandName) {
        String subject = "Application Update - " + campaignTitle;
        String html = EmailTemplates.applicationRejected(userName, campaignTitle, brandName);
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Notify brand of new application
     */
    default void sendNewApplicationNotificationEmail(String to, String brandName, String creatorName,
            String campaignTitle) {
        String subject = "New Application for " + campaignTitle;
        String html = EmailTemplates.newApplicationForBrand(brandName, creatorName, campaignTitle);
        sendHtmlEmail(to, subject, html);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 4. DELIVERABLE EMAILS
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Send deliverable submitted notification to brand
     */
    default void sendDeliverableSubmittedEmail(String to, String brandName, String creatorName, String campaignTitle) {
        String subject = "New Deliverable Submitted - " + campaignTitle;
        String html = EmailTemplates.deliverableSubmitted(brandName, creatorName, campaignTitle);
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Send deliverable approved notification to creator
     */
    default void sendDeliverableApprovedEmail(String to, String userName, String campaignTitle, String amount) {
        String subject = "Deliverable Approved! 💰 - " + campaignTitle;
        String html = EmailTemplates.deliverableApproved(userName, campaignTitle, amount);
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Send revision requested notification to creator
     */
    default void sendRevisionRequestedEmail(String to, String userName, String campaignTitle, String feedback) {
        String subject = "Revision Requested - " + campaignTitle;
        String html = EmailTemplates.revisionRequested(userName, campaignTitle, feedback);
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Send deliverable rejected notification
     */
    default void sendDeliverableRejectedEmail(String to, String userName, String campaignTitle, String reason) {
        String subject = "Deliverable Update - " + campaignTitle;
        String html = EmailTemplates.deliverableRejected(userName, campaignTitle, reason);
        sendHtmlEmail(to, subject, html);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 5. WITHDRAWAL EMAILS
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Send withdrawal request confirmation email
     */
    default void sendWithdrawalRequestedEmail(String to, String userName, String amount, String withdrawalId) {
        String subject = "Withdrawal Request Received - CreatorX";
        String html = EmailTemplates.withdrawalRequested(userName, amount, withdrawalId);
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Send withdrawal approved notification email
     */
    default void sendWithdrawalApprovedEmail(String to, String userName, String amount, String withdrawalId) {
        String subject = "Withdrawal Approved! 💸 - CreatorX";
        String html = EmailTemplates.withdrawalApproved(userName, amount, withdrawalId);
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Send withdrawal completed notification (money sent to bank)
     */
    default void sendWithdrawalCompletedEmail(String to, String userName, String amount, String bankAccountLast4) {
        String subject = "Withdrawal Complete - Funds Transferred! - CreatorX";
        String html = EmailTemplates.withdrawalCompleted(userName, amount, bankAccountLast4);
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Send withdrawal rejected notification email
     */
    default void sendWithdrawalRejectedEmail(String to, String userName, String amount, String reason) {
        String subject = "Withdrawal Request Update - CreatorX";
        String html = EmailTemplates.withdrawalRejected(userName, amount, reason);
        sendHtmlEmail(to, subject, html);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 6. PASSWORD RESET EMAILS
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Send password reset email with OTP/link
     */
    default void sendPasswordResetEmail(String to, String userName, String resetLink) {
        String subject = "Reset Your Password - CreatorX";
        String html = EmailTemplates.passwordReset(userName, resetLink);
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Send password changed confirmation
     */
    default void sendPasswordChangedEmail(String to, String userName) {
        String subject = "Password Changed Successfully - CreatorX";
        String html = EmailTemplates.passwordChanged(userName);
        sendHtmlEmail(to, subject, html);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // UTILITY EMAILS
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Send campaign completed summary to brand
     */
    default void sendCampaignCompletedEmail(String to, String brandName, String campaignTitle, int creatorsCount,
            String totalSpent) {
        String subject = "Campaign Complete - " + campaignTitle;
        String html = EmailTemplates.campaignCompleted(brandName, campaignTitle, creatorsCount, totalSpent);
        sendHtmlEmail(to, subject, html);
    }
}
