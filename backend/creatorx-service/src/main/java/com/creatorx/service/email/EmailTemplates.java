package com.creatorx.service.email;

/**
 * HTML Email Templates for CreatorX
 * All templates use inline CSS for email client compatibility
 */
public final class EmailTemplates {

    private EmailTemplates() {
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // BASE TEMPLATE
    // ─────────────────────────────────────────────────────────────────────────────

    private static final String BASE_TEMPLATE = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>%s</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                <!-- Header -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #1337ec 0%%, #7c3aed 100%%); padding: 32px 40px; text-align: center;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">CreatorX</h1>
                                    </td>
                                </tr>
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px;">
                                        %s
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                                        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                                            © 2026 CreatorX. All rights reserved.
                                        </p>
                                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                            You're receiving this because you're a CreatorX user.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """;

    private static String wrap(String title, String content) {
        return String.format(BASE_TEMPLATE, title, content);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. WELCOME EMAIL
    // ─────────────────────────────────────────────────────────────────────────────

    public static String welcome(String userName, String userRole) {
        String roleMessage = switch (userRole.toUpperCase()) {
            case "CREATOR" -> "Start discovering campaigns and monetize your influence!";
            case "BRAND" -> "Create your first campaign and connect with amazing creators!";
            default -> "Explore the platform and get started!";
        };

        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">Welcome to CreatorX! 🎉</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            We're thrilled to have you join the CreatorX community! %s
                        </p>
                        <div style="background-color: #f0f9ff; border-left: 4px solid #1337ec; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                            <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: 600;">Getting Started:</p>
                            <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #1e40af; font-size: 14px;">
                                <li>Complete your profile to stand out</li>
                                <li>Connect your social media accounts</li>
                                <li>Complete KYC verification for payments</li>
                            </ul>
                        </div>
                        <a href="https://creatorx.app" style="display: inline-block; background: linear-gradient(135deg, #1337ec 0%%, #7c3aed 100%%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Get Started
                        </a>
                        """,
                userName, roleMessage);

        return wrap("Welcome to CreatorX", content);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. KYC EMAILS
    // ─────────────────────────────────────────────────────────────────────────────

    public static String kycSubmitted(String userName, String documentType) {
        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">KYC Documents Received</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            We've received your KYC documents (%s) and they are now being reviewed by our team.
                        </p>
                        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                            <p style="margin: 0; color: #92400e; font-size: 14px;">
                                <strong>⏱ Expected Review Time:</strong> 24-48 hours
                            </p>
                        </div>
                        <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            We'll notify you as soon as the verification is complete.
                        </p>
                        """,
                userName, documentType);

        return wrap("KYC Documents Received", content);
    }

    public static String kycApproved(String userName) {
        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">KYC Verified! ✅</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Congratulations! Your KYC verification has been approved. You now have full access to all CreatorX features.
                        </p>
                        <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                            <p style="margin: 0 0 8px 0; color: #065f46; font-size: 14px; font-weight: 600;">You can now:</p>
                            <ul style="margin: 0; padding-left: 20px; color: #065f46; font-size: 14px;">
                                <li>Apply to premium campaigns</li>
                                <li>Receive payments for your work</li>
                                <li>Withdraw funds to your bank account</li>
                            </ul>
                        </div>
                        <a href="https://creatorx.app/campaigns" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Explore Campaigns
                        </a>
                        """,
                userName);

        return wrap("KYC Verification Approved", content);
    }

    public static String kycRejected(String userName, String reason) {
        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">KYC Verification Update</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            We were unable to verify your KYC documents. Please review the feedback below and resubmit.
                        </p>
                        <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                            <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px; font-weight: 600;">Reason:</p>
                            <p style="margin: 0; color: #991b1b; font-size: 14px;">%s</p>
                        </div>
                        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                            <strong>Tips for resubmission:</strong>
                        </p>
                        <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                            <li>Ensure documents are clear and not blurry</li>
                            <li>All information must be visible and legible</li>
                            <li>Documents must be valid and not expired</li>
                        </ul>
                        <a href="https://creatorx.app/kyc" style="display: inline-block; background: linear-gradient(135deg, #1337ec 0%%, #7c3aed 100%%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Resubmit Documents
                        </a>
                        """,
                userName, reason);

        return wrap("KYC Verification Update", content);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 3. APPLICATION EMAILS
    // ─────────────────────────────────────────────────────────────────────────────

    public static String applicationSubmitted(String userName, String campaignTitle, String brandName) {
        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">Application Submitted! 📝</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Your application for the campaign has been submitted successfully!
                        </p>
                        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Campaign</p>
                            <p style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600;">%s</p>
                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Brand</p>
                            <p style="margin: 0; color: #111827; font-size: 16px;">%s</p>
                        </div>
                        <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            The brand will review your application and get back to you soon. We'll notify you when there's an update!
                        </p>
                        """,
                userName, campaignTitle, brandName);

        return wrap("Application Submitted", content);
    }

    public static String applicationApproved(String userName, String campaignTitle, String brandName, String amount) {
        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">You've Been Selected! 🎉</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Great news! You've been selected for the campaign. Time to create amazing content!
                        </p>
                        <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 24px 0;">
                            <p style="margin: 0 0 8px 0; color: #065f46; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Campaign</p>
                            <p style="margin: 0 0 16px 0; color: #065f46; font-size: 18px; font-weight: 600;">%s</p>
                            <p style="margin: 0 0 8px 0; color: #065f46; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Brand</p>
                            <p style="margin: 0 0 16px 0; color: #065f46; font-size: 16px;">%s</p>
                            <p style="margin: 0 0 8px 0; color: #065f46; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Earnings</p>
                            <p style="margin: 0; color: #065f46; font-size: 24px; font-weight: 700;">%s</p>
                        </div>
                        <a href="https://creatorx.app/active-campaigns" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            View Campaign Details
                        </a>
                        """,
                userName, campaignTitle, brandName, amount);

        return wrap("You've Been Selected!", content);
    }

    public static String applicationRejected(String userName, String campaignTitle, String brandName) {
        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">Application Update</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Unfortunately, your application for <strong>%s</strong> by %s was not selected this time.
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Don't be discouraged! There are many more opportunities waiting for you. Keep applying to campaigns that match your profile.
                        </p>
                        <a href="https://creatorx.app/campaigns" style="display: inline-block; background: linear-gradient(135deg, #1337ec 0%%, #7c3aed 100%%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Explore More Campaigns
                        </a>
                        """,
                userName, campaignTitle, brandName);

        return wrap("Application Update", content);
    }

    public static String newApplicationForBrand(String brandName, String creatorName, String campaignTitle) {
        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">New Application Received! 📬</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            You've received a new application from <strong>%s</strong> for your campaign.
                        </p>
                        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Campaign</p>
                            <p style="margin: 0; color: #111827; font-size: 18px; font-weight: 600;">%s</p>
                        </div>
                        <a href="https://brand.creatorx.app/applications" style="display: inline-block; background: linear-gradient(135deg, #1337ec 0%%, #7c3aed 100%%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Review Application
                        </a>
                        """,
                brandName, creatorName, campaignTitle);

        return wrap("New Application Received", content);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 4. DELIVERABLE EMAILS
    // ─────────────────────────────────────────────────────────────────────────────

    public static String deliverableSubmitted(String brandName, String creatorName, String campaignTitle) {
        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">New Deliverable Submitted 📦</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            <strong>%s</strong> has submitted a deliverable for your campaign <strong>%s</strong>.
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Please review the submission and approve it or request revisions.
                        </p>
                        <a href="https://brand.creatorx.app/deliverables" style="display: inline-block; background: linear-gradient(135deg, #1337ec 0%%, #7c3aed 100%%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Review Deliverable
                        </a>
                        """,
                brandName, creatorName, campaignTitle);

        return wrap("New Deliverable Submitted", content);
    }

    public static String deliverableApproved(String userName, String campaignTitle, String amount) {
        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">Deliverable Approved! 💰</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Great work! Your deliverable for <strong>%s</strong> has been approved.
                        </p>
                        <div style="background-color: #d1fae5; padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center;">
                            <p style="margin: 0 0 8px 0; color: #065f46; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Earnings Added</p>
                            <p style="margin: 0; color: #065f46; font-size: 32px; font-weight: 700;">%s</p>
                        </div>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            The amount has been added to your wallet and is now available for withdrawal.
                        </p>
                        <a href="https://creatorx.app/wallet" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            View Wallet
                        </a>
                        """,
                userName, campaignTitle, amount);

        return wrap("Deliverable Approved", content);
    }

    public static String revisionRequested(String userName, String campaignTitle, String feedback) {
        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">Revision Requested 📝</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            The brand has requested some changes to your deliverable for <strong>%s</strong>.
                        </p>
                        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                            <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">Feedback:</p>
                            <p style="margin: 0; color: #92400e; font-size: 14px;">%s</p>
                        </div>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Please review the feedback and submit a revised version.
                        </p>
                        <a href="https://creatorx.app/active-campaigns" style="display: inline-block; background: linear-gradient(135deg, #1337ec 0%%, #7c3aed 100%%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Submit Revision
                        </a>
                        """,
                userName, campaignTitle, feedback);

        return wrap("Revision Requested", content);
    }

    public static String deliverableRejected(String userName, String campaignTitle, String reason) {
        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">Deliverable Update</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Unfortunately, your deliverable for <strong>%s</strong> was not approved.
                        </p>
                        <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                            <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px; font-weight: 600;">Reason:</p>
                            <p style="margin: 0; color: #991b1b; font-size: 14px;">%s</p>
                        </div>
                        <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            If you believe this is an error, please contact the brand or our support team.
                        </p>
                        """,
                userName, campaignTitle, reason);

        return wrap("Deliverable Update", content);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 5. WITHDRAWAL EMAILS
    // ─────────────────────────────────────────────────────────────────────────────

    public static String withdrawalRequested(String userName, String amount, String withdrawalId) {
        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">Withdrawal Request Received</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            We've received your withdrawal request and it's being processed.
                        </p>
                        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
                            <table width="100%%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <span style="color: #6b7280; font-size: 14px;">Amount</span>
                                    </td>
                                    <td style="padding: 8px 0; text-align: right;">
                                        <span style="color: #111827; font-size: 18px; font-weight: 600;">%s</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <span style="color: #6b7280; font-size: 14px;">Withdrawal ID</span>
                                    </td>
                                    <td style="padding: 8px 0; text-align: right;">
                                        <span style="color: #111827; font-size: 14px; font-family: monospace;">%s</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <span style="color: #6b7280; font-size: 14px;">Expected Time</span>
                                    </td>
                                    <td style="padding: 8px 0; text-align: right;">
                                        <span style="color: #111827; font-size: 14px;">2-3 business days</span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                            You can track the status in your wallet. We'll notify you when the transfer is complete.
                        </p>
                        """,
                userName, amount, withdrawalId);

        return wrap("Withdrawal Request Received", content);
    }

    public static String withdrawalApproved(String userName, String amount, String withdrawalId) {
        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">Withdrawal Approved! ✅</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Great news! Your withdrawal request has been approved and is being processed.
                        </p>
                        <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 24px 0;">
                            <table width="100%%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <span style="color: #065f46; font-size: 14px;">Amount</span>
                                    </td>
                                    <td style="padding: 8px 0; text-align: right;">
                                        <span style="color: #065f46; font-size: 18px; font-weight: 600;">%s</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <span style="color: #065f46; font-size: 14px;">Withdrawal ID</span>
                                    </td>
                                    <td style="padding: 8px 0; text-align: right;">
                                        <span style="color: #065f46; font-size: 14px; font-family: monospace;">%s</span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                            The funds will be transferred to your bank account within 24-48 hours.
                        </p>
                        """,
                userName, amount, withdrawalId);

        return wrap("Withdrawal Approved", content);
    }

    public static String withdrawalCompleted(String userName, String amount, String bankAccountLast4) {
        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">Funds Transferred! 💸</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Your withdrawal has been completed and the funds have been transferred!
                        </p>
                        <div style="background-color: #d1fae5; padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center;">
                            <p style="margin: 0 0 8px 0; color: #065f46; font-size: 14px;">Amount Transferred</p>
                            <p style="margin: 0 0 16px 0; color: #065f46; font-size: 32px; font-weight: 700;">%s</p>
                            <p style="margin: 0; color: #065f46; font-size: 14px;">To bank account ending in ****%s</p>
                        </div>
                        <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                            Thank you for being a valued creator on CreatorX!
                        </p>
                        """,
                userName, amount, bankAccountLast4);

        return wrap("Withdrawal Complete", content);
    }

    public static String withdrawalRejected(String userName, String amount, String reason) {
        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">Withdrawal Update</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Unfortunately, your withdrawal request for <strong>%s</strong> could not be processed.
                        </p>
                        <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                            <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px; font-weight: 600;">Reason:</p>
                            <p style="margin: 0; color: #991b1b; font-size: 14px;">%s</p>
                        </div>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            The amount has been credited back to your wallet. Please ensure your bank details are correct and try again.
                        </p>
                        <a href="https://creatorx.app/wallet" style="display: inline-block; background: linear-gradient(135deg, #1337ec 0%%, #7c3aed 100%%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            View Wallet
                        </a>
                        """,
                userName, amount, reason);

        return wrap("Withdrawal Update", content);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 6. PASSWORD RESET EMAILS
    // ─────────────────────────────────────────────────────────────────────────────

    public static String passwordReset(String userName, String resetLink) {
        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">Reset Your Password</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            We received a request to reset your password. Click the button below to create a new password.
                        </p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="%s" style="display: inline-block; background: linear-gradient(135deg, #1337ec 0%%, #7c3aed 100%%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                Reset Password
                            </a>
                        </div>
                        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                        </p>
                        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                            <p style="margin: 0; color: #92400e; font-size: 12px;">
                                <strong>Security Tip:</strong> Never share this link with anyone. CreatorX will never ask for your password.
                            </p>
                        </div>
                        """,
                userName, resetLink);

        return wrap("Reset Your Password", content);
    }

    public static String passwordChanged(String userName) {
        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">Password Changed Successfully</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Your password has been changed successfully. You can now log in with your new password.
                        </p>
                        <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 12px 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                            <p style="margin: 0; color: #065f46; font-size: 14px;">
                                ✓ Password updated successfully
                            </p>
                        </div>
                        <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                            If you didn't make this change, please contact our support team immediately.
                        </p>
                        """,
                userName);

        return wrap("Password Changed", content);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // UTILITY EMAILS
    // ─────────────────────────────────────────────────────────────────────────────

    public static String campaignCompleted(String brandName, String campaignTitle, int creatorsCount,
            String totalSpent) {
        String content = String.format(
                """
                        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">Campaign Complete! 🎉</h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hi %s,
                        </p>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Your campaign <strong>%s</strong> has been completed successfully!
                        </p>
                        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
                            <table width="100%%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <span style="color: #6b7280; font-size: 14px;">Creators</span>
                                    </td>
                                    <td style="padding: 8px 0; text-align: right;">
                                        <span style="color: #111827; font-size: 18px; font-weight: 600;">%d</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <span style="color: #6b7280; font-size: 14px;">Total Spent</span>
                                    </td>
                                    <td style="padding: 8px 0; text-align: right;">
                                        <span style="color: #111827; font-size: 18px; font-weight: 600;">%s</span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <a href="https://brand.creatorx.app/campaigns" style="display: inline-block; background: linear-gradient(135deg, #1337ec 0%%, #7c3aed 100%%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            View Campaign Report
                        </a>
                        """,
                brandName, campaignTitle, creatorsCount, totalSpent);

        return wrap("Campaign Complete", content);
    }
}
