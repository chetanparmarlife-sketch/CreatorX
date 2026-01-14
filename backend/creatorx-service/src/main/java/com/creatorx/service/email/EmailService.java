package com.creatorx.service.email;

import java.util.Map;

/**
 * Email service interface for sending business emails
 * Implementations: SendGridEmailService, NoOpEmailService
 */
public interface EmailService {
    
    /**
     * Send a simple text email
     */
    void sendEmail(String to, String subject, String body);
    
    /**
     * Send a templated email with variables
     */
    void sendTemplatedEmail(String to, String templateId, Map<String, String> variables);
    
    /**
     * Check if email service is enabled
     */
    boolean isEnabled();
    
    // ─────────────────────────────────────────────────────────────────────────────
    // Business Email Methods
    // ─────────────────────────────────────────────────────────────────────────────
    
    /**
     * Send withdrawal request confirmation email
     */
    default void sendWithdrawalRequestedEmail(String to, String userName, String amount, String withdrawalId) {
        String subject = "Withdrawal Request Received - CreatorX";
        String body = String.format(
            "Hi %s,\n\n" +
            "Your withdrawal request for %s has been received and is being processed.\n\n" +
            "Withdrawal ID: %s\n" +
            "Expected processing time: 2-3 business days\n\n" +
            "You can track the status in your wallet.\n\n" +
            "Best regards,\n" +
            "The CreatorX Team",
            userName, amount, withdrawalId
        );
        sendEmail(to, subject, body);
    }
    
    /**
     * Send withdrawal approved notification email
     */
    default void sendWithdrawalApprovedEmail(String to, String userName, String amount, String withdrawalId) {
        String subject = "Withdrawal Approved - CreatorX";
        String body = String.format(
            "Hi %s,\n\n" +
            "Great news! Your withdrawal request for %s has been approved.\n\n" +
            "Withdrawal ID: %s\n" +
            "The funds will be transferred to your bank account within 24-48 hours.\n\n" +
            "Thank you for being a valued creator on CreatorX!\n\n" +
            "Best regards,\n" +
            "The CreatorX Team",
            userName, amount, withdrawalId
        );
        sendEmail(to, subject, body);
    }
    
    /**
     * Send withdrawal rejected notification email
     */
    default void sendWithdrawalRejectedEmail(String to, String userName, String amount, String reason) {
        String subject = "Withdrawal Request Update - CreatorX";
        String body = String.format(
            "Hi %s,\n\n" +
            "Unfortunately, your withdrawal request for %s could not be processed.\n\n" +
            "Reason: %s\n\n" +
            "Please ensure your bank details are correct and try again, or contact support for assistance.\n\n" +
            "Best regards,\n" +
            "The CreatorX Team",
            userName, amount, reason
        );
        sendEmail(to, subject, body);
    }
    
    /**
     * Send KYC approved notification email
     */
    default void sendKycApprovedEmail(String to, String userName) {
        String subject = "KYC Verification Approved - CreatorX";
        String body = String.format(
            "Hi %s,\n\n" +
            "Congratulations! Your KYC verification has been approved.\n\n" +
            "You now have full access to all features including:\n" +
            "• Applying to campaigns\n" +
            "• Receiving payments\n" +
            "• Withdrawing funds\n\n" +
            "Start exploring campaigns and grow your creator career!\n\n" +
            "Best regards,\n" +
            "The CreatorX Team",
            userName
        );
        sendEmail(to, subject, body);
    }
    
    /**
     * Send KYC rejected notification email
     */
    default void sendKycRejectedEmail(String to, String userName, String reason) {
        String subject = "KYC Verification Update - CreatorX";
        String body = String.format(
            "Hi %s,\n\n" +
            "We were unable to verify your KYC documents.\n\n" +
            "Reason: %s\n\n" +
            "Please re-submit your documents with the following in mind:\n" +
            "• Ensure documents are clear and not blurry\n" +
            "• All information must be visible and legible\n" +
            "• Documents must be valid and not expired\n\n" +
            "If you have questions, please contact our support team.\n\n" +
            "Best regards,\n" +
            "The CreatorX Team",
            userName, reason
        );
        sendEmail(to, subject, body);
    }
}
