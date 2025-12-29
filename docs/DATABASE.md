# CreatorX Database Documentation

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Entity Relationship Diagram](#entity-relationship-diagram)
4. [Core Tables](#core-tables)
5. [Indexes](#indexes)
6. [Migrations](#migrations)
7. [Query Patterns](#query-patterns)
8. [Performance Optimization](#performance-optimization)

---

## Overview

CreatorX uses **PostgreSQL 15+** as the primary database. The schema is managed through **Flyway migrations** and follows relational database best practices.

### Database Details

- **Database Name**: `creatorx`
- **Default Port**: `5432`
- **Character Set**: UTF-8
- **Timezone**: UTC
- **Migration Tool**: Flyway

### Connection String

```
jdbc:postgresql://localhost:5432/creatorx?user=postgres&password=postgres
```

---

## Database Schema

### Schema Version

Current schema version: **V15** (with performance indexes)

### Schema Management

- **Flyway Migrations**: Located in `backend/creatorx-api/src/main/resources/db/migration/`
- **Naming Convention**: `V{version}__{description}.sql`
- **Baseline Version**: V1

---

## Entity Relationship Diagram

```
┌─────────────┐
│    users    │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌────▼──────┐
│user_profiles│ │creator_    │ │brand_     │
│             │ │profiles    │ │profiles   │
└─────────────┘ └─────┬──────┘ └────┬──────┘
                      │             │
                      │             │
┌─────────────────────▼─────────────▼──────┐
│              campaigns                    │
└──────┬───────────────────────────────────┘
       │
       ├──────────────────┐
       │                  │
┌──────▼──────┐    ┌──────▼──────────┐
│applications│    │campaign_         │
│            │    │deliverables      │
└──────┬─────┘    └──────────────────┘
       │
       │
┌──────▼──────────┐
│  deliverables   │
└─────────────────┘

┌─────────────┐
│   wallets   │
└──────┬──────┘
       │
┌──────▼──────────┐
│  transactions   │
└─────────────────┘

┌─────────────┐
│conversations│
└──────┬──────┘
       │
┌──────▼──────┐
│   messages  │
└─────────────┘

┌─────────────┐
│notifications│
└─────────────┘

┌─────────────┐
│kyc_documents│
└─────────────┘
```

---

## Core Tables

### 1. `users`

Primary user account table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | User ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| phone | VARCHAR(20) | UNIQUE | Phone number |
| supabase_id | VARCHAR(255) | UNIQUE | Supabase Auth user ID |
| role | ENUM | NOT NULL | CREATOR, BRAND, ADMIN |
| status | ENUM | NOT NULL | ACTIVE, INACTIVE, SUSPENDED |
| email_verified | BOOLEAN | DEFAULT false | Email verification status |
| phone_verified | BOOLEAN | DEFAULT false | Phone verification status |
| last_login_at | TIMESTAMP | | Last login timestamp |
| created_at | TIMESTAMP | NOT NULL | Account creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes**:
- `idx_users_email` - Fast email lookups
- `idx_users_phone` - Fast phone lookups
- `idx_users_supabase_id` - Fast Supabase ID lookups
- `idx_users_role` - Filter by role
- `idx_users_status` - Filter by status

---

### 2. `user_profiles`

Extended user profile information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | UUID | PK, FK → users.id | User reference |
| full_name | VARCHAR(255) | | Full name |
| avatar_url | VARCHAR(500) | | Profile picture URL |
| bio | TEXT | | Biography |
| location | VARCHAR(255) | | Location |
| date_of_birth | DATE | | Date of birth |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Update time |

**Indexes**:
- `idx_user_profiles_user` - Fast user lookups

---

### 3. `creator_profiles`

Creator-specific profile information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | UUID | PK, FK → users.id | User reference |
| niche | VARCHAR(100) | | Content niche |
| follower_count | BIGINT | DEFAULT 0 | Follower count |
| engagement_rate | DECIMAL(5,2) | | Engagement rate |
| verified | BOOLEAN | DEFAULT false | Verification status |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Update time |

**Indexes**:
- `idx_creator_profiles_user` - Fast user lookups

---

### 4. `campaigns`

Campaign listings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Campaign ID |
| brand_id | UUID | FK → users.id | Brand owner |
| title | VARCHAR(255) | NOT NULL | Campaign title |
| description | TEXT | | Campaign description |
| budget | DECIMAL(12,2) | NOT NULL | Campaign budget |
| platform | ENUM | NOT NULL | INSTAGRAM, YOUTUBE, etc. |
| category | VARCHAR(100) | | Category |
| status | ENUM | NOT NULL | DRAFT, ACTIVE, COMPLETED, etc. |
| start_date | DATE | | Campaign start date |
| end_date | DATE | | Campaign end date |
| application_deadline | DATE | | Application deadline |
| max_applicants | INTEGER | | Maximum applicants |
| selected_creators_count | INTEGER | DEFAULT 0 | Selected creators |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Update time |

**Indexes**:
- `idx_campaigns_brand` - Fast brand lookups
- `idx_campaigns_status` - Filter by status
- `idx_campaigns_status_dates` - Active campaigns by date
- `idx_campaigns_category_platform` - Filter by category/platform
- `idx_campaigns_fts` - Full-text search

---

### 5. `applications`

Campaign applications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Application ID |
| campaign_id | UUID | FK → campaigns.id | Campaign reference |
| creator_id | UUID | FK → users.id | Creator reference |
| status | ENUM | NOT NULL | APPLIED, SHORTLISTED, etc. |
| pitch_text | TEXT | | Application pitch |
| expected_timeline | VARCHAR(255) | | Expected timeline |
| applied_at | TIMESTAMP | NOT NULL | Application time |
| updated_at | TIMESTAMP | NOT NULL | Update time |

**Indexes**:
- `idx_applications_campaign` - Fast campaign lookups
- `idx_applications_creator` - Fast creator lookups
- `idx_applications_creator_status` - Creator applications by status
- `idx_applications_campaign_status` - Campaign applications by status

---

### 6. `wallets`

User wallets.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Wallet ID |
| user_id | UUID | FK → users.id, UNIQUE | User reference |
| balance | DECIMAL(12,2) | DEFAULT 0 | Available balance |
| pending_balance | DECIMAL(12,2) | DEFAULT 0 | Pending balance |
| total_earned | DECIMAL(12,2) | DEFAULT 0 | Total earned |
| total_withdrawn | DECIMAL(12,2) | DEFAULT 0 | Total withdrawn |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Update time |

**Indexes**:
- `idx_wallets_user` - Fast user lookups

---

### 7. `transactions`

Transaction history.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Transaction ID |
| user_id | UUID | FK → users.id | User reference |
| type | ENUM | NOT NULL | EARNING, WITHDRAWAL, etc. |
| amount | DECIMAL(12,2) | NOT NULL | Transaction amount |
| status | ENUM | NOT NULL | PENDING, COMPLETED, FAILED |
| description | TEXT | | Transaction description |
| reference_id | UUID | | Related entity ID |
| created_at | TIMESTAMP | NOT NULL | Transaction time |

**Indexes**:
- `idx_transactions_user` - Fast user lookups
- `idx_transactions_user_date` - User transactions by date
- `idx_transactions_type` - Filter by type

---

### 8. `conversations`

Messaging conversations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Conversation ID |
| creator_id | UUID | FK → users.id | Creator reference |
| brand_id | UUID | FK → users.id | Brand reference |
| campaign_id | UUID | FK → campaigns.id | Campaign reference |
| creator_unread_count | INTEGER | DEFAULT 0 | Creator unread count |
| brand_unread_count | INTEGER | DEFAULT 0 | Brand unread count |
| last_message_at | TIMESTAMP | | Last message time |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Update time |

**Indexes**:
- `idx_conversations_participants` - Fast participant lookups

---

### 9. `messages`

Individual messages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Message ID |
| conversation_id | UUID | FK → conversations.id | Conversation reference |
| sender_id | UUID | FK → users.id | Sender reference |
| content | TEXT | NOT NULL | Message content |
| read | BOOLEAN | DEFAULT false | Read status |
| created_at | TIMESTAMP | NOT NULL | Message time |

**Indexes**:
- `idx_messages_conversation` - Fast conversation lookups
- `idx_messages_conversation_date` - Messages by conversation and date

---

### 10. `notifications`

Push and in-app notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Notification ID |
| user_id | UUID | FK → users.id | User reference |
| type | ENUM | NOT NULL | APPLICATION, MESSAGE, etc. |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| read | BOOLEAN | DEFAULT false | Read status |
| metadata | JSONB | | Additional data |
| created_at | TIMESTAMP | NOT NULL | Creation time |

**Indexes**:
- `idx_notifications_user` - Fast user lookups
- `idx_notifications_user_read` - User notifications by read status

---

## Indexes

### Performance Indexes (V15)

All indexes are documented in `V15__add_performance_indexes.sql`:

1. **Campaign Indexes**:
   - `idx_campaigns_status_dates` - Active campaigns by date
   - `idx_campaigns_category_platform` - Filter by category/platform
   - `idx_campaigns_fts` - Full-text search

2. **Application Indexes**:
   - `idx_applications_creator_status` - Creator applications
   - `idx_applications_campaign_status` - Campaign applications

3. **Transaction Indexes**:
   - `idx_transactions_user_date` - User transactions by date
   - `idx_transactions_type` - Filter by type

4. **Message Indexes**:
   - `idx_messages_conversation_date` - Messages by conversation

5. **Notification Indexes**:
   - `idx_notifications_user_read` - User notifications by read status

---

## Migrations

### Migration Files

Located in: `backend/creatorx-api/src/main/resources/db/migration/`

Key migrations:
- `V1__create_enums.sql` - Enum types
- `V2__create_users_and_profiles.sql` - User tables
- `V3__create_campaigns.sql` - Campaign tables
- `V4__create_applications.sql` - Application tables
- `V5__create_wallet_and_transactions.sql` - Wallet tables
- `V6__create_messaging.sql` - Messaging tables
- `V7__create_notifications.sql` - Notification tables
- `V8__create_kyc.sql` - KYC tables
- `V9__create_additional_indexes_and_constraints.sql` - Initial indexes
- `V15__add_performance_indexes.sql` - Performance indexes

### Running Migrations

Migrations run automatically on application startup via Flyway.

Manual execution:
```bash
./gradlew flywayMigrate
```

---

## Query Patterns

### Common Queries

#### 1. Get Active Campaigns

```sql
SELECT * FROM campaigns 
WHERE status = 'ACTIVE' 
  AND start_date <= CURRENT_DATE 
  AND end_date >= CURRENT_DATE
ORDER BY created_at DESC
LIMIT 20;
```

#### 2. Get User Applications

```sql
SELECT a.*, c.title as campaign_title
FROM applications a
JOIN campaigns c ON a.campaign_id = c.id
WHERE a.creator_id = :userId
ORDER BY a.applied_at DESC;
```

#### 3. Get Wallet Balance

```sql
SELECT balance, pending_balance, total_earned
FROM wallets
WHERE user_id = :userId;
```

#### 4. Get Unread Messages

```sql
SELECT COUNT(*) 
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE (c.creator_id = :userId AND c.creator_unread_count > 0)
   OR (c.brand_id = :userId AND c.brand_unread_count > 0);
```

---

## Performance Optimization

### Query Optimization

1. **Use Indexes**: All frequently queried columns are indexed
2. **Pagination**: All list queries use LIMIT/OFFSET
3. **Selective Loading**: Use DTOs to fetch only needed fields
4. **Connection Pooling**: HikariCP configured

### Monitoring

Monitor slow queries:
```sql
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

Check index usage:
```sql
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

---

## Backup & Recovery

### Backup

```bash
pg_dump -h localhost -U postgres -d creatorx -F c -f backup.dump
```

### Restore

```bash
pg_restore -h localhost -U postgres -d creatorx backup.dump
```

---

**Last Updated**: [Date]  
**Version**: 1.0.0

