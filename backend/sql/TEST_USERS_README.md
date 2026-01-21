# Test Users Setup Guide

This document explains how to create test user accounts for the CreatorX platform.

## Test Accounts

| Email | Password | Role | Dashboard |
|-------|----------|------|-----------|
| `creator@test.com` | `password123` | CREATOR | Mobile App |
| `brand@test.com` | `password123` | BRAND | Brand Dashboard (localhost:3000) |
| `admin@test.com` | `password123` | ADMIN | Admin Dashboard (localhost:3001) |

## Running the Seed Script

### Option 1: Supabase SQL Editor (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the entire contents of `backend/sql/seed-test-users.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. Verify the success message and query results

### Option 2: PSQL Command Line

```bash
# From project root
cd backend

# Run with your Supabase connection string
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres" -f sql/seed-test-users.sql

# Or with individual parameters
psql -h [YOUR-PROJECT].supabase.co -p 5432 -d postgres -U postgres -f sql/seed-test-users.sql
```

### Option 3: Java Database Migration

If you have Flyway set up, copy the file to:
```
backend/src/main/resources/db/migration/V999__seed_test_users.sql
```

## Verifying Users Were Created

Run these queries in Supabase SQL Editor:

```sql
-- Check all test users
SELECT email, role, status, email_verified 
FROM users 
WHERE email LIKE '%@test.com';

-- Check creator wallet balance
SELECT u.email, w.balance, w.available_balance
FROM wallets w
JOIN users u ON w.user_id = u.id
WHERE u.email = 'creator@test.com';
```

## Testing Login

### Brand Dashboard Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "brand@test.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "user": {
    "id": "a1b2c3d4-e5f6-4789-abcd-222222222222",
    "email": "brand@test.com",
    "role": "BRAND"
  }
}
```

### Admin Dashboard Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }'
```

### Creator (Mobile App) Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@test.com",
    "password": "password123"
  }'
```

## BCrypt Hash Details

The password `password123` is hashed using BCrypt with strength 10:

```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

To generate a new hash (if needed), use Spring's BCryptPasswordEncoder:

```java
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
String hash = encoder.encode("password123");
System.out.println(hash);
```

Or online: https://bcrypt-generator.com/ (use 10 rounds)

## Troubleshooting

### "Invalid credentials" error

1. Check the password hash is correctly inserted:
   ```sql
   SELECT email, password_hash FROM users WHERE email = 'brand@test.com';
   ```

2. Verify the user status is ACTIVE:
   ```sql
   SELECT status, email_verified FROM users WHERE email = 'brand@test.com';
   ```

3. Check role matches expected:
   ```sql
   SELECT role FROM users WHERE email = 'brand@test.com';
   -- Should return: BRAND
   ```

### "User not found" error

Run the seed script again to ensure users are created.

### Database connection issues

Verify your Supabase connection string in `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://[PROJECT].supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=[YOUR_PASSWORD]
```

## Resetting Test Data

To completely reset test users, run:

```sql
DELETE FROM bank_accounts WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.com'
);
DELETE FROM wallets WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.com'
);
DELETE FROM creator_profiles WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.com'
);
DELETE FROM brand_profiles WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.com'
);
DELETE FROM user_profiles WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.com'
);
DELETE FROM users WHERE email LIKE '%@test.com';
```

Then run the seed script again.
