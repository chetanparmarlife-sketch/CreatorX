INSERT INTO admin_permissions (admin_id, permission)
SELECT u.id, 'ADMIN_MESSAGES_MANAGE'
FROM users u
WHERE u.role = 'ADMIN'
ON CONFLICT (admin_id, permission) DO NOTHING;
