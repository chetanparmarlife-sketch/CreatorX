# CreatorX Database Schema Documentation

## Overview

CreatorX uses PostgreSQL 15+ as the primary database. The schema is managed through Flyway migrations and follows best practices for relational database design.

## Entity Relationship Diagram

To generate an ER diagram:

### Option 1: Using SchemaSpy
```bash
docker run -v $(pwd):/output schemaspy/schemaspy:latest \
  -t pgsql \
  -host localhost \
  -port 5432 \
  -db creatorx \
  -u postgres \
  -p postgres \
  -o /output/schema-docs
```

### Option 2: Using dbdocs.io
1. Install dbdocs CLI: `npm install -g @dbdocs/cli`
2. Create `dbdocs.dbml` file
3. Run: `dbdocs build dbdocs.dbml`

## Core Tables

### Users & Authentication

#### `users`
Primary user table storing authentication and basic profile information.

**Columns:**
- `id` (UUID, PK): Unique user identifier
- `email` (VARCHAR, UNIQUE): User email address
- `phone` (VARCHAR, UNIQUE): User phone number
- `supabase_id` (VARCHAR, UNIQUE): Supabase Auth user ID
- `password_hash` (VARCHAR): Password hash (managed by Supabase)
- `role` (ENUM): CREATOR, BRAND, ADMIN
- `status` (ENUM): ACTIVE, INACTIVE, SUSPENDED
- `email_verified` (BOOLEAN): Email verification status
- `phone_verified` (BOOLEAN): Phone verification status
- `last_login_at` (TIMESTAMP): Last login timestamp
- `created_at` (TIMESTAMP): Account creation time
- `updated_at` (TIMESTAMP): Last update time

**Indexes:**
- `idx_users_email`: Fast email lookups
- `idx_users_phone`: Fast phone lookups
- `idx_users_supabase_id`: Fast Supabase ID lookups
- `idx_users_role`: Filter by role
- `idx_users_status`: Filter by status

#### `user_profiles`
Extended user profile information.

**Columns:**
- `user_id` (UUID, FK → users.id): Reference to user
- `full_name` (VARCHAR): User's full name
- `avatar_url` (VARCHAR): Profile picture URL
- `bio` (TEXT): User biography
- `location` (VARCHAR): User location
- `date_of_birth` (DATE): Date of birth

#### `creator_profiles`
Creator-specific profile information.

**Columns:**
- `user_id` (UUID, FK → users.id): Reference to user
- `username` (VARCHAR, UNIQUE): Creator username
- `category` (VARCHAR): Content category
- `follower_count` (INTEGER): Total followers
- `engagement_rate` (DECIMAL): Engagement rate percentage
- `verified` (BOOLEAN): Verification badge status

#### `brand_profiles`
Brand-specific profile information.

**Columns:**
- `user_id` (UUID, FK → users.id): Reference to user
- `company_name` (VARCHAR): Company name
- `company_logo_url` (VARCHAR): Company logo URL
- `industry` (VARCHAR): Industry sector
- `website` (VARCHAR): Company website
- `gst_number` (VARCHAR): GST registration number
- `verified` (BOOLEAN): Verification badge status

### Campaigns

#### `campaigns`
Brand campaigns for creator collaborations.

**Columns:**
- `id` (UUID, PK): Campaign identifier
- `brand_id` (UUID, FK → users.id): Brand who created campaign
- `title` (VARCHAR): Campaign title
- `description` (TEXT): Campaign description
- `budget` (DECIMAL): Total campaign budget
- `platform` (ENUM): INSTAGRAM, YOUTUBE, TWITTER, TIKTOK, LINKEDIN
- `category` (VARCHAR): Campaign category
- `status` (ENUM): DRAFT, ACTIVE, PAUSED, COMPLETED, CANCELLED
- `start_date` (DATE): Campaign start date
- `end_date` (DATE): Campaign end date
- `application_deadline` (DATE): Application deadline
- `max_applicants` (INTEGER): Maximum creators to select
- `selected_creators_count` (INTEGER): Currently selected creators
- `created_at` (TIMESTAMP): Creation time
- `updated_at` (TIMESTAMP): Last update time

**Indexes:**
- `idx_campaigns_brand_id`: Fast brand lookups
- `idx_campaigns_status`: Filter by status
- `idx_campaigns_platform`: Filter by platform
- `idx_campaigns_category`: Filter by category
- `idx_campaigns_status_dates`: Composite index for active campaigns

**Constraints:**
- `chk_budget_positive`: Budget must be > 0
- `chk_dates_valid`: End date >= start date

#### `campaign_deliverables`
Required deliverables for a campaign.

**Columns:**
- `id` (UUID, PK): Deliverable identifier
- `campaign_id` (UUID, FK → campaigns.id): Parent campaign
- `title` (VARCHAR): Deliverable title
- `description` (TEXT): Deliverable description
- `type` (ENUM): IMAGE, VIDEO, STORY, REEL, POST, etc.
- `due_date` (DATE): Due date
- `is_mandatory` (BOOLEAN): Whether deliverable is mandatory
- `order_index` (INTEGER): Display order

### Applications

#### `applications`
Creator applications to campaigns.

**Columns:**
- `id` (UUID, PK): Application identifier
- `campaign_id` (UUID, FK → campaigns.id): Applied campaign
- `creator_id` (UUID, FK → users.id): Applicant creator
- `status` (ENUM): APPLIED, SHORTLISTED, SELECTED, REJECTED, WITHDRAWN
- `pitch_text` (TEXT): Application pitch
- `expected_timeline` (VARCHAR): Expected completion timeline
- `applied_at` (TIMESTAMP): Application submission time
- `updated_at` (TIMESTAMP): Last update time

**Indexes:**
- `idx_campaign_creator`: Fast lookups by campaign and creator
- `idx_status`: Filter by status

### Wallet & Transactions

#### `wallets`
User wallet balances.

**Columns:**
- `user_id` (UUID, FK → users.id, PK): User identifier
- `balance` (DECIMAL): Available balance
- `pending_balance` (DECIMAL): Pending earnings
- `total_earned` (DECIMAL): Lifetime earnings
- `total_withdrawn` (DECIMAL): Total withdrawn amount
- `currency` (ENUM): INR, USD, EUR
- `updated_at` (TIMESTAMP): Last update time

#### `transactions`
Financial transactions.

**Columns:**
- `id` (UUID, PK): Transaction identifier
- `user_id` (UUID, FK → users.id): Transaction owner
- `type` (ENUM): EARNING, WITHDRAWAL, REFUND, BONUS, PENALTY
- `amount` (DECIMAL): Transaction amount
- `status` (ENUM): PENDING, COMPLETED, FAILED
- `campaign_id` (UUID, FK → campaigns.id): Related campaign
- `razorpay_payment_id` (VARCHAR): Razorpay transaction ID
- `created_at` (TIMESTAMP): Transaction time

**Indexes:**
- `idx_transactions_user_id`: Fast user transaction lookups
- `idx_transactions_type_status`: Filter by type and status
- `idx_transactions_created_at`: Sort by date

### Messaging

#### `conversations`
Conversations between creators and brands.

**Columns:**
- `id` (UUID, PK): Conversation identifier
- `creator_id` (UUID, FK → users.id): Creator participant
- `brand_id` (UUID, FK → users.id): Brand participant
- `campaign_id` (UUID, FK → campaigns.id): Related campaign
- `creator_unread_count` (INTEGER): Unread messages for creator
- `brand_unread_count` (INTEGER): Unread messages for brand
- `last_message_at` (TIMESTAMP): Last message timestamp
- `created_at` (TIMESTAMP): Conversation creation time

**Indexes:**
- `idx_participants`: Fast lookups by participants
- `idx_updated_at`: Sort by activity

#### `messages`
Individual messages in conversations.

**Columns:**
- `id` (UUID, PK): Message identifier
- `conversation_id` (UUID, FK → conversations.id): Parent conversation
- `sender_id` (UUID, FK → users.id): Message sender
- `content` (TEXT): Message content
- `read` (BOOLEAN): Read status
- `read_at` (TIMESTAMP): Read timestamp
- `created_at` (TIMESTAMP): Message time

**Indexes:**
- `idx_messages_conversation_id`: Fast conversation message lookups
- `idx_messages_sender_id`: Filter by sender
- `idx_messages_conversation_created`: Sort messages in conversation

## Index Strategy

### Performance Indexes
- **User lookups**: Email, phone, Supabase ID
- **Campaign searches**: Status, platform, category, dates
- **Transaction queries**: User ID, type, status, date
- **Message queries**: Conversation ID, sender, read status

### Composite Indexes
- `idx_campaigns_status_dates`: For active campaign queries
- `idx_messages_conversation_created`: For message pagination
- `idx_campaign_creator`: For application lookups

## Migration History

| Version | Description |
|---------|-------------|
| V1 | Create enum types |
| V2 | Create users and profiles |
| V3 | Create campaigns |
| V4 | Create applications |
| V5 | Create wallet and transactions |
| V6 | Create messaging and notifications |
| V7 | Create KYC and referrals |
| V8 | Create triggers |
| V11 | Add Supabase ID to users |
| V12 | Create saved campaigns |
| V13 | Create storage buckets and policies |

## Data Relationships

```
users
  ├── user_profiles (1:1)
  ├── creator_profiles (1:1)
  ├── brand_profiles (1:1)
  ├── campaigns (1:N) [as brand]
  ├── applications (1:N) [as creator]
  ├── wallets (1:1)
  ├── transactions (1:N)
  └── conversations (1:N) [as creator or brand]

campaigns
  ├── campaign_deliverables (1:N)
  ├── applications (1:N)
  └── conversations (1:N)

conversations
  └── messages (1:N)
```

## Best Practices

1. **Use indexes** for frequently queried columns
2. **Foreign keys** ensure referential integrity
3. **Enum types** for type safety
4. **Timestamps** for audit trails
5. **Soft deletes** where appropriate (status field)
6. **Partitioning** for large tables (future optimization)

## Performance Considerations

- **Connection pooling**: HikariCP configured for optimal performance
- **Query optimization**: Use EXPLAIN ANALYZE for slow queries
- **Index maintenance**: Regular VACUUM and ANALYZE
- **Caching**: Redis for frequently accessed data

