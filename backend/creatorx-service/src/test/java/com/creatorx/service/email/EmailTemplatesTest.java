package com.creatorx.service.email;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Email Template Tests
 * Validates all HTML templates are generated correctly
 */
@DisplayName("Email Templates Tests")
class EmailTemplatesTest {

    private static final String TEST_USER = "Test User";

    @Test
    @DisplayName("Welcome email template - Creator")
    void testWelcomeEmailTemplateCreator() {
        String html = EmailTemplates.welcome(TEST_USER, "CREATOR");

        assertNotNull(html);
        assertTrue(html.contains("Welcome to CreatorX"));
        assertTrue(html.contains(TEST_USER));
        assertTrue(html.contains("Start discovering campaigns"));
        assertTrue(html.contains("<!DOCTYPE html>"));
    }

    @Test
    @DisplayName("Welcome email template - Brand")
    void testWelcomeEmailTemplateBrand() {
        String html = EmailTemplates.welcome(TEST_USER, "BRAND");

        assertNotNull(html);
        assertTrue(html.contains("Create your first campaign"));
    }

    @Test
    @DisplayName("KYC submitted email template")
    void testKycSubmittedEmailTemplate() {
        String html = EmailTemplates.kycSubmitted(TEST_USER, "Aadhaar");

        assertNotNull(html);
        assertTrue(html.contains("KYC Documents Received"));
        assertTrue(html.contains("Aadhaar"));
        assertTrue(html.contains("24-48 hours"));
    }

    @Test
    @DisplayName("KYC approved email template")
    void testKycApprovedEmailTemplate() {
        String html = EmailTemplates.kycApproved(TEST_USER);

        assertNotNull(html);
        assertTrue(html.contains("KYC Verified"));
        assertTrue(html.contains(TEST_USER));
        assertTrue(html.contains("Apply to premium campaigns"));
    }

    @Test
    @DisplayName("KYC rejected email template")
    void testKycRejectedEmailTemplate() {
        String html = EmailTemplates.kycRejected(TEST_USER, "Document is blurry");

        assertNotNull(html);
        assertTrue(html.contains("KYC Verification Update"));
        assertTrue(html.contains("Document is blurry"));
        assertTrue(html.contains("Resubmit"));
    }

    @Test
    @DisplayName("Application submitted email template")
    void testApplicationSubmittedEmailTemplate() {
        String html = EmailTemplates.applicationSubmitted(
                TEST_USER,
                "Summer Fashion Campaign",
                "Nike");

        assertNotNull(html);
        assertTrue(html.contains("Application Submitted"));
        assertTrue(html.contains("Summer Fashion Campaign"));
        assertTrue(html.contains("Nike"));
    }

    @Test
    @DisplayName("Application approved email template")
    void testApplicationApprovedEmailTemplate() {
        String html = EmailTemplates.applicationApproved(
                TEST_USER,
                "Summer Fashion Campaign",
                "Nike",
                "₹25,000");

        assertNotNull(html);
        assertTrue(html.contains("Selected"));
        assertTrue(html.contains("Summer Fashion Campaign"));
        assertTrue(html.contains("Nike"));
        assertTrue(html.contains("₹25,000"));
    }

    @Test
    @DisplayName("Application rejected email template")
    void testApplicationRejectedEmailTemplate() {
        String html = EmailTemplates.applicationRejected(
                TEST_USER,
                "Summer Fashion Campaign",
                "Nike");

        assertNotNull(html);
        assertTrue(html.contains("Application Update"));
        assertTrue(html.contains("not selected"));
    }

    @Test
    @DisplayName("Deliverable submitted email template")
    void testDeliverableSubmittedEmailTemplate() {
        String html = EmailTemplates.deliverableSubmitted(
                "Brand Manager",
                "Creator Name",
                "Summer Campaign");

        assertNotNull(html);
        assertTrue(html.contains("New Deliverable Submitted"));
        assertTrue(html.contains("Creator Name"));
    }

    @Test
    @DisplayName("Deliverable approved email template")
    void testDeliverableApprovedEmailTemplate() {
        String html = EmailTemplates.deliverableApproved(
                TEST_USER,
                "Summer Fashion Campaign",
                "₹10,000");

        assertNotNull(html);
        assertTrue(html.contains("Deliverable Approved"));
        assertTrue(html.contains("₹10,000"));
    }

    @Test
    @DisplayName("Revision requested email template")
    void testRevisionRequestedEmailTemplate() {
        String html = EmailTemplates.revisionRequested(
                TEST_USER,
                "Summer Fashion Campaign",
                "Please add the product link in the caption");

        assertNotNull(html);
        assertTrue(html.contains("Revision Requested"));
        assertTrue(html.contains("add the product link"));
    }

    @Test
    @DisplayName("Withdrawal requested email template")
    void testWithdrawalRequestedEmailTemplate() {
        String html = EmailTemplates.withdrawalRequested(
                TEST_USER,
                "₹15,000",
                "WD-123456");

        assertNotNull(html);
        assertTrue(html.contains("Withdrawal Request Received"));
        assertTrue(html.contains("₹15,000"));
        assertTrue(html.contains("WD-123456"));
    }

    @Test
    @DisplayName("Withdrawal completed email template")
    void testWithdrawalCompletedEmailTemplate() {
        String html = EmailTemplates.withdrawalCompleted(
                TEST_USER,
                "₹15,000",
                "1234");

        assertNotNull(html);
        assertTrue(html.contains("Funds Transferred"));
        assertTrue(html.contains("₹15,000"));
        assertTrue(html.contains("****1234"));
    }

    @Test
    @DisplayName("Password reset email template")
    void testPasswordResetEmailTemplate() {
        String html = EmailTemplates.passwordReset(
                TEST_USER,
                "https://creatorx.app/reset?token=abc123");

        assertNotNull(html);
        assertTrue(html.contains("Reset Your Password"));
        assertTrue(html.contains("https://creatorx.app/reset?token=abc123"));
        assertTrue(html.contains("1 hour"));
    }

    @Test
    @DisplayName("Password changed email template")
    void testPasswordChangedEmailTemplate() {
        String html = EmailTemplates.passwordChanged(TEST_USER);

        assertNotNull(html);
        assertTrue(html.contains("Password Changed"));
        assertTrue(html.contains("successfully"));
    }

    @Test
    @DisplayName("Campaign completed email template")
    void testCampaignCompletedEmailTemplate() {
        String html = EmailTemplates.campaignCompleted(
                "Brand Manager",
                "Summer Fashion Campaign",
                5,
                "₹1,25,000");

        assertNotNull(html);
        assertTrue(html.contains("Campaign Complete"));
        assertTrue(html.contains("Summer Fashion Campaign"));
        assertTrue(html.contains("5"));
        assertTrue(html.contains("₹1,25,000"));
    }
}
