# CreatorX Database Schema Documentation

## Overview

Complete PostgreSQL database schema for CreatorX marketplace with 10 migration files covering all entities, relationships, indexes, and triggers.

## Migration Files

| File | Description |
|------|-------------|
| V1__create_enums.sql | Creates all PostgreSQL ENUM types |
| V2__create_users_and_profiles.sql | User authentication and profile tables |
| V3__create_campaigns.sql | Campaign management tables |
| V4__create_applications_and_deliverables.sql | Application and submission tables |
| V5__create_wallet_and_transactions.sql | Financial transaction tables |
| V6__create_messaging_and_notifications.sql | Communication tables |
| V7__create_admin_and_referrals.sql | Admin actions and referral system |
| V8__create_triggers.sql | Automatic timestamp updates and business logic |
| V9__create_additional_indexes_and_constraints.sql | Performance optimization |
| V10__create_extensions.sql | PostgreSQL extensions |

## Entity Summary

### User Management (5 tables)
- `users` - Core authentication
- `user_profiles` - Common profile data
- `creator_profiles` - Creator-specific data
- `brand_profiles` - Brand-specific data
- `kyc_documents` - KYC verification

### Campaign Management (4 tables)
- `campaigns` - Campaign definitions
- `campaign_deliverables` - Required deliverables
- `campaign_tags` - Campaign tags
- `campaign_requirements` - Detailed requirements

### Applications & Deliverables (4 tables)
- `applications` - Creator applications
- `application_feedback` - Brand feedback
- `deliverable_submissions` - Creator submissions
- `deliverable_reviews` - Brand reviews

### Financial System (4 tables)
- `wallets` - User wallet balances
- `transactions` - All transactions
- `withdrawal_requests` - Withdrawal requests
- `bank_accounts` - Bank account details

### Communication (3 tables)
- `conversations` - Chat conversations
- `messages` - Individual messages
- `notifications` - In-app notifications

### Admin & Referrals (3 tables)
- `admin_actions` - Admin audit log
- `disputes` - Dispute management
- `referrals` - Referral program

**Total: 23 tables**

## Key Features

### ✅ ENUM Types
- 15+ ENUM types for type safety
- User roles, statuses, document types, etc.
- Better performance than VARCHAR with CHECK

### ✅ Indexes
- **50+ indexes** for optimal query performance
- Foreign key indexes
- Composite indexes for common queries
- Partial indexes for filtered queries
- Full-text search indexes

### ✅ Constraints
- Foreign key constraints with CASCADE/RESTRICT
- CHECK constraints for data validation
- UNIQUE constraints where needed
- NOT NULL constraints for required fields

### ✅ Triggers
- Automatic `updated_at` timestamp updates
- Conversation unread count management
- Message read status tracking

### ✅ Data Integrity
- Referential integrity via foreign keys
- Business rule validation via CHECK constraints
- Audit trail via `admin_actions` table

## Running Migrations

### Using Flyway (Automatic)
Migrations run automatically on application startup when:
```yaml
spring.flyway.enabled: true
```

### Manual Execution
```bash
# Connect to database
psql -h localhost -U postgres -d creatorx

# Run migrations manually (if needed)
\i V1__create_enums.sql
\i V2__create_users_and_profiles.sql
# ... etc
```

### Using Docker
```bash
# Migrations run automatically when Spring Boot starts
docker-compose up -d app
```

## Schema Validation

After migrations, verify schema:
```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- List all indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- List all ENUM types
SELECT typname 
FROM pg_type 
WHERE typtype = 'e'
ORDER BY typname;
```

## Performance Tuning

### Recommended Settings
```sql
-- Increase shared buffers (in postgresql.conf)
shared_buffers = 256MB

-- Enable query planner statistics
track_io_timing = on
track_functions = all
```

### Monitoring Queries
```sql
-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

## Backup & Recovery

### Backup
```bash
# Full database backup
pg_dump -h localhost -U postgres -d creatorx -F c -f creatorx_backup.dump

# Schema only
pg_dump -h localhost -U postgres -d creatorx -s -f creatorx_schema.sql
```

### Restore
```bash
# Restore from backup
pg_restore -h localhost -U postgres -d creatorx creatorx_backup.dump
```

## Security Considerations

1. **Password Hashing**: Use bcrypt/argon2 (application level)
2. **KYC Documents**: Store in Supabase Storage, not database
3. **Bank Account Numbers**: Consider encryption for PCI compliance
4. **Row-Level Security**: Can be enabled for multi-tenant scenarios
5. **Connection Encryption**: Use SSL/TLS for database connections

## Next Steps

1. ✅ Schema created
2. ⏳ Update JPA entities to match schema
3. ⏳ Create repository interfaces
4. ⏳ Implement service layer
5. ⏳ Add API endpoints
6. ⏳ Write integration tests

## Support

For schema questions or issues:
- See `SCHEMA_OVERVIEW.md` for detailed entity relationships
- Check migration files for specific table definitions
- Review indexes in V9 migration for query optimization




