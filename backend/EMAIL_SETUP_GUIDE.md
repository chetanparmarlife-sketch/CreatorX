# 📧 SendGrid Email Integration Guide

## Overview

CreatorX uses SendGrid for transactional emails. This guide covers setup, configuration, testing, and customization.

## Email Types Implemented

| Type | Methods | Description |
|------|---------|-------------|
| **Welcome** | `sendWelcomeEmail()` | New user registration |
| **KYC** | `sendKycSubmittedEmail()`, `sendKycApprovedEmail()`, `sendKycRejectedEmail()` | KYC verification status |
| **Applications** | `sendApplicationSubmittedEmail()`, `sendApplicationApprovedEmail()`, `sendApplicationRejectedEmail()`, `sendNewApplicationNotificationEmail()` | Campaign applications |
| **Deliverables** | `sendDeliverableSubmittedEmail()`, `sendDeliverableApprovedEmail()`, `sendRevisionRequestedEmail()`, `sendDeliverableRejectedEmail()` | Content delivery |
| **Withdrawals** | `sendWithdrawalRequestedEmail()`, `sendWithdrawalApprovedEmail()`, `sendWithdrawalCompletedEmail()`, `sendWithdrawalRejectedEmail()` | Payment withdrawals |
| **Password** | `sendPasswordResetEmail()`, `sendPasswordChangedEmail()` | Password management |

---

## Setup Instructions

### 1. Create SendGrid Account

1. Go to https://sendgrid.com
2. Create a free account (100 emails/day free tier)
3. Verify your email address

### 2. Generate API Key

1. Go to Settings → API Keys
2. Click "Create API Key"
3. Select "Full Access" or "Restricted Access" with Mail Send permissions
4. Copy the API key (shown only once!)

### 3. Verify Sender Identity

**Option A: Single Sender (Quick)**
1. Go to Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Fill in your sender details
4. Click verification link in email

**Option B: Domain Authentication (Production)**
1. Go to Settings → Sender Authentication
2. Click "Authenticate Your Domain"
3. Follow DNS setup instructions
4. Wait for verification (up to 48 hours)

### 4. Configure Environment Variables

```env
# Enable email service
EMAIL_ENABLED=true

# SendGrid API Key
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# From address (must be verified)
EMAIL_FROM_ADDRESS=noreply@creatorx.com
EMAIL_FROM_NAME=CreatorX
```

### 5. Update application.yml (already configured)

```yaml
creatorx:
  email:
    enabled: ${EMAIL_ENABLED:false}
    sendgrid:
      api-key: ${SENDGRID_API_KEY:}
    from:
      email: ${EMAIL_FROM_ADDRESS:noreply@creatorx.com}
      name: ${EMAIL_FROM_NAME:CreatorX}
```

---

## Files Structure

```
backend/creatorx-service/src/main/java/com/creatorx/service/email/
├── EmailService.java          # Interface with all email methods
├── EmailTemplates.java        # HTML templates
├── SendGridEmailService.java  # SendGrid implementation
└── NoOpEmailService.java      # Dev/test implementation

backend/creatorx-service/src/test/java/com/creatorx/service/email/
├── EmailServiceTest.java      # Service tests
└── EmailTemplatesTest.java    # Template tests
```

---

## Usage Examples

### Inject EmailService

```java
@Service
public class KYCService {
    
    @Autowired
    private EmailService emailService;
    
    public void approveKyc(String userId) {
        // ... approval logic ...
        
        // Send email notification
        emailService.sendKycApprovedEmail(
            user.getEmail(),
            user.getName()
        );
    }
}
```

### Send Custom HTML Email

```java
emailService.sendHtmlEmail(
    "user@example.com",
    "Custom Subject",
    "<html><body><h1>Hello!</h1></body></html>"
);
```

### Send Templated Email (SendGrid Dynamic Templates)

```java
emailService.sendTemplatedEmail(
    "user@example.com",
    "d-xxxxxxxxxxxxxxxxx", // SendGrid template ID
    Map.of(
        "name", "John",
        "amount", "₹10,000"
    )
);
```

---

## Testing

### Run Template Tests

```bash
cd backend
./gradlew :creatorx-service:test --tests EmailTemplatesTest
```

### Test with Real SendGrid (Manual)

1. Update `EmailTemplatesTest.java`
2. Uncomment the live test methods
3. Set your email address
4. Run:

```bash
cd backend
./gradlew test --tests EmailTemplatesTest \
  -DEMAIL_ENABLED=true \
  -DSENDGRID_API_KEY=your-api-key
```

### Verify Email Delivery

```bash
# Check SendGrid Activity
# Dashboard → Activity → Email Activity
```

---

## HTML Template Customization

### Modify Base Template

Edit `EmailTemplates.java` and update `BASE_TEMPLATE`:

```java
private static final String BASE_TEMPLATE = """
    <!DOCTYPE html>
    <html>
    <head>...</head>
    <body>
        <!-- Your custom template -->
        %s  <!-- Content placeholder -->
    </body>
    </html>
    """;
```

### Add New Email Type

1. Add method to `EmailService.java`:

```java
default void sendCustomEmail(String to, String param) {
    String subject = "Custom Subject";
    String html = EmailTemplates.customEmail(param);
    sendHtmlEmail(to, subject, html);
}
```

2. Add template to `EmailTemplates.java`:

```java
public static String customEmail(String param) {
    String content = String.format("""
        <h2>Custom Email</h2>
        <p>Parameter: %s</p>
        """, param);
    return wrap("Custom Email", content);
}
```

---

## Production Checklist

- [ ] Domain authentication completed
- [ ] Dedicated IP (for high volume)
- [ ] Sender reputation monitoring
- [ ] Unsubscribe link in emails
- [ ] SPF, DKIM, DMARC records configured
- [ ] Bounce handling configured
- [ ] Rate limiting implemented

---

## Troubleshooting

### Emails Not Sending

1. Check `EMAIL_ENABLED=true`
2. Verify API key is correct
3. Check sender is verified
4. Check SendGrid Activity for errors

### Emails Going to Spam

1. Authenticate your domain (not just single sender)
2. Set up SPF, DKIM, DMARC
3. Warm up your IP if using dedicated IP
4. Check email content for spam triggers

### Rate Limits

| Plan | Daily Limit |
|------|-------------|
| Free | 100 |
| Essentials | 100,000 |
| Pro | 1,500,000 |

---

## Environment-Specific Configuration

### Development (EMAIL_ENABLED=false)
- Uses `NoOpEmailService`
- Emails logged but not sent
- No API key required

### Staging (EMAIL_ENABLED=true)
- Uses `SendGridEmailService`
- Test API key recommended
- Limited to test emails

### Production (EMAIL_ENABLED=true)
- Domain authenticated
- Production API key
- Monitoring enabled

---

*Last updated: January 2026*
