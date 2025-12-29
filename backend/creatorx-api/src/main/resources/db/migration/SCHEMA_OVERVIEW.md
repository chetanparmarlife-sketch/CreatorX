# CreatorX Database Schema Overview

## Database Structure

This document provides an overview of the CreatorX PostgreSQL database schema.

## Migration Files

1. **V1__create_enums.sql** - Creates all ENUM types
2. **V2__create_users_and_profiles.sql** - User authentication and profiles
3. **V3__create_campaigns.sql** - Campaign management
4. **V4__create_applications_and_deliverables.sql** - Applications and submissions
5. **V5__create_wallet_and_transactions.sql** - Financial transactions
6. **V6__create_messaging_and_notifications.sql** - Communication
7. **V7__create_admin_and_referrals.sql** - Admin and referral system
8. **V8__create_triggers.sql** - Automatic timestamp updates
9. **V9__create_additional_indexes_and_constraints.sql** - Performance optimization
10. **V10__create_extensions.sql** - PostgreSQL extensions

## Entity Relationships

### Core User System
```
users (1) ──┬── (1) user_profiles
            ├── (1) creator_profiles (if role = CREATOR)
            ├── (1) brand_profiles (if role = BRAND)
            ├── (1) wallets
            ├── (*) kyc_documents
            ├── (*) bank_accounts
            └── (*) transactions
```

### Campaign System
```
campaigns (1) ──┬── (*) campaign_deliverables
                ├── (*) campaign_tags
                ├── (*) campaign_requirements
                ├── (*) applications
                └── (*) conversations
```

### Application Flow
```
applications (1) ──┬── (1) application_feedback
                   └── (*) deliverable_submissions
                        └── (1) deliverable_reviews
```

### Financial System
```
wallets (1) ──┬── (*) transactions
              └── (*) withdrawal_requests
                   └── (1) bank_accounts
```

### Messaging System
```
conversations (1) ──┬── (*) messages
                   └── (1) campaigns (optional)
```

## Key Design Decisions

### 1. UUID Primary Keys
- All tables use UUID for primary keys
- Better for distributed systems
- Prevents enumeration attacks
- Generated using `gen_random_uuid()`

### 2. ENUM Types
- Used for status fields and fixed value sets
- Provides type safety at database level
- Better performance than VARCHAR with CHECK constraints
- Easier to query and maintain

### 3. Soft Deletes
- User status field instead of hard deletes
- Preserves data integrity and audit trail
- Allows account recovery

### 4. JSONB Fields
- Used for flexible metadata storage
- Portfolio items, transaction metadata, notification data
- Allows schema evolution without migrations
- Indexable with GIN indexes

### 5. Timestamps
- All tables have `created_at` and `updated_at`
- Automatically maintained by triggers
- Timezone-aware (TIMESTAMP WITH TIME ZONE)

### 6. Indexing Strategy
- Indexes on foreign keys for JOIN performance
- Composite indexes for common query patterns
- Partial indexes for filtered queries
- Full-text search indexes for content search

## Performance Considerations

### Indexes
- **Foreign Keys**: All foreign keys are indexed
- **Status Fields**: Indexed for filtering
- **Date Fields**: Indexed for sorting and range queries
- **Composite Indexes**: For multi-column queries
- **Partial Indexes**: For filtered queries (e.g., active campaigns only)

### Query Optimization
- Use EXPLAIN ANALYZE to identify slow queries
- Monitor index usage with `pg_stat_user_indexes`
- Consider materialized views for complex aggregations
- Use connection pooling (PgBouncer recommended)

### Scalability
- Partition large tables by date if needed (transactions, messages)
- Use read replicas for reporting queries
- Consider caching frequently accessed data (Redis)

## Security Considerations

### Data Protection
- Password hashes (never store plain text)
- KYC documents stored in Supabase Storage (not in DB)
- Sensitive data encrypted at rest (PostgreSQL encryption)
- Bank account numbers stored (consider encryption for PCI compliance)

### Access Control
- Row-level security (RLS) can be enabled for multi-tenant scenarios
- Application-level authorization (Spring Security)
- Audit trail via `admin_actions` table

## Maintenance

### Regular Tasks
1. **Vacuum**: Run `VACUUM ANALYZE` regularly
2. **Index Maintenance**: Rebuild indexes if needed
3. **Statistics**: Update table statistics for query planner
4. **Backup**: Regular backups (daily recommended)

### Monitoring
- Monitor table sizes and growth
- Track slow queries
- Monitor index usage
- Check for missing indexes

## Common Queries

### Find Active Campaigns
```sql
SELECT * FROM campaigns 
WHERE status = 'ACTIVE' 
  AND start_date <= CURRENT_DATE 
  AND end_date >= CURRENT_DATE;
```

### Get User Wallet Balance
```sql
SELECT balance, pending_balance, total_earned 
FROM wallets 
WHERE user_id = ?;
```

### Find Unread Messages
```sql
SELECT * FROM messages 
WHERE conversation_id = ? 
  AND read = FALSE 
ORDER BY created_at DESC;
```

### Campaign Applications Count
```sql
SELECT campaign_id, COUNT(*) as application_count
FROM applications
WHERE status = 'APPLIED'
GROUP BY campaign_id;
```

## Migration Best Practices

1. **Always test migrations** in development first
2. **Backup database** before production migrations
3. **Run migrations during low-traffic periods**
4. **Monitor migration performance** (some may take time on large tables)
5. **Have rollback plan** for critical migrations

## Future Enhancements

1. **Partitioning**: Consider partitioning `transactions` and `messages` by date
2. **Archiving**: Archive old data to separate tables
3. **Materialized Views**: For complex reporting queries
4. **Full-Text Search**: Enhance with Elasticsearch if needed
5. **Time-Series Data**: Consider TimescaleDB for analytics




