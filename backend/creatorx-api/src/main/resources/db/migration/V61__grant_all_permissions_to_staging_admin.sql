-- Grant all permissions to any user with role 'ADMIN' that doesn't have them yet

INSERT INTO admin_permissions (admin_id, permission)
SELECT u.id, p.permission
FROM users u
CROSS JOIN (
    VALUES 
        ('ADMIN_USERS_READ'),
        ('ADMIN_USERS_WRITE'),
        ('ADMIN_KYC_REVIEW'),
        ('ADMIN_BRAND_VERIFICATION_REVIEW'),
        ('ADMIN_CAMPAIGN_MODERATION'),
        ('ADMIN_MODERATION_RULES'),
        ('ADMIN_DISPUTE_MANAGE'),
        ('ADMIN_AUDIT_READ'),
        ('ADMIN_COMPLIANCE_MANAGE'),
        ('ADMIN_FINANCE_READ'),
        ('ADMIN_SETTINGS_MANAGE'),
        ('ADMIN_SYSTEM_READ'),
        ('ADMIN_PERMISSIONS_MANAGE'),
        ('ADMIN_CAMPAIGN_MANAGE'),
        ('ADMIN_MESSAGES'),
        ('ADMIN_MESSAGES_MANAGE'),
        ('ADMIN_CAMPAIGN_REVIEW')
) AS p(permission)
WHERE u.role = 'ADMIN'
ON CONFLICT (admin_id, permission) DO NOTHING;
