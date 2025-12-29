# Supabase Auth + Spring Security Integration Guide

## Overview

This implementation uses **Supabase Auth** for user authentication (registration, login, password reset) and **Spring Security** for JWT token validation and role-based access control.

## Architecture

```
┌─────────────────┐         ┌──────────────┐         ┌──────────────┐
│  React Native   │────────▶│   Supabase   │────────▶│ Spring Boot  │
│      App        │  JWT    │     Auth     │  JWT    │   Backend    │
└─────────────────┘         └──────────────┘         └──────────────┘
     │                            │                         │
     │                            │                         │
     └────────────────────────────┴─────────────────────────┘
                    User Profile & Roles
```

**Flow:**
1. User registers/logs in via Supabase SDK in React Native
2. Supabase returns JWT token
3. React Native app sends JWT token to Spring Boot API
4. Spring Boot validates JWT signature using Supabase public key
5. Spring Boot loads user from database using Supabase user ID
6. Spring Security sets authentication with user role

## Backend Setup

### 1. Configuration

Add to `application.yml`:

```yaml
supabase:
  url: ${SUPABASE_URL:https://your-project.supabase.co}
  jwt:
    secret: ${SUPABASE_JWT_SECRET:} # Optional fallback
  service:
    role:
      key: ${SUPABASE_SERVICE_ROLE_KEY:} # For admin operations
```

### 2. Environment Variables

```bash
# .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret  # Optional
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Optional
```

### 3. Database Migration

Run migration to add `supabase_id` column:

```sql
-- V11__add_supabase_id_to_users.sql
ALTER TABLE users ADD COLUMN supabase_id VARCHAR(255) UNIQUE;
CREATE INDEX idx_users_supabase_id ON users(supabase_id);
```

### 4. Key Components

#### SupabaseJwtService
- Validates Supabase JWT tokens using RS256
- Fetches public key from Supabase JWKS endpoint
- Extracts user ID from token claims

#### SupabaseJwtAuthenticationFilter
- Intercepts requests with JWT tokens
- Validates token signature
- Loads user from database
- Sets Spring Security authentication

#### AuthService
- Links Supabase users to internal user profiles
- Manages user verification status
- Updates last login timestamps

## React Native Setup

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 2. Configuration

Create `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Supabase Client

The `src/lib/supabase.ts` file provides:
- Supabase client singleton
- Session management
- Auto-refresh token

### 4. AuthContext

The `src/context/AuthContext.tsx` provides:
- `signIn(email, password)`
- `signUp(email, password, role, name, phone)`
- `signOut()`
- `resetPassword(email)`
- `updatePassword(newPassword)`
- Auto token refresh
- Session persistence

## Usage Examples

### Login Screen

```typescript
import { useAuth } from '@/src/context/AuthContext';

const { signIn, loading } = useAuth();

const handleLogin = async () => {
  try {
    await signIn(email, password);
    router.replace('/(tabs)');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### Register Screen

```typescript
const { signUp } = useAuth();

const handleRegister = async () => {
  try {
    await signUp(email, password, 'CREATOR', name, phone);
    Alert.alert('Success', 'Please verify your email');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### Protected Route

```typescript
import { useAuth } from '@/src/context/AuthContext';

export default function ProtectedScreen() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <LoginScreen />;

  return <YourContent />;
}
```

## API Client Integration

The API client automatically attaches Supabase JWT token:

```typescript
// src/api/client.ts already handles this
// Token is read from AsyncStorage and attached to requests
```

## Security Features

### 1. JWT Validation
- ✅ RS256 signature verification
- ✅ Token expiration check
- ✅ Issuer validation (Supabase)
- ✅ Public key caching (1 hour)

### 2. Role-Based Access Control

```java
@PreAuthorize("hasRole('CREATOR')")
@GetMapping("/campaigns/my")
public ResponseEntity<List<Campaign>> getMyCampaigns() {
    // Only creators can access
}

@PreAuthorize("hasRole('BRAND')")
@PostMapping("/campaigns")
public ResponseEntity<Campaign> createCampaign() {
    // Only brands can create campaigns
}
```

### 3. Password Requirements
- Minimum 8 characters (enforced by Supabase)
- Can be customized in Supabase dashboard

### 4. Email Verification
- Supabase sends verification email
- Backend tracks verification status
- Can require verification before app access

## Webhook Setup (Optional)

For automatic user profile creation, set up Supabase webhook:

1. Go to Supabase Dashboard → Database → Webhooks
2. Create webhook for `auth.users` table
3. On INSERT, call: `POST /api/v1/auth/link-supabase-user`

## Testing

### 1. Test Registration
```bash
# In React Native app
await signUp('test@example.com', 'password123', 'CREATOR', 'Test User');
```

### 2. Test Login
```bash
await signIn('test@example.com', 'password123');
```

### 3. Test API Call
```bash
# Token automatically attached
const campaigns = await campaignService.getCampaigns();
```

## Troubleshooting

### Issue: "Invalid token"
- Check Supabase URL is correct
- Verify JWT secret matches
- Check token expiration

### Issue: "User not found"
- Ensure user is linked via `/auth/link-supabase-user`
- Check `supabase_id` column exists in database

### Issue: "Token validation failed"
- Check Supabase JWKS endpoint is accessible
- Verify network connectivity
- Check public key caching

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Configure environment variables
3. ✅ Run database migration
4. ✅ Test registration flow
5. ✅ Test login flow
6. ✅ Test API authentication
7. ✅ Set up email verification
8. ✅ Configure password reset

## Security Best Practices

1. **Never expose service role key** in client
2. **Use environment variables** for secrets
3. **Enable email verification** in Supabase
4. **Set up rate limiting** for auth endpoints
5. **Monitor failed login attempts**
6. **Use HTTPS** in production
7. **Rotate JWT secrets** periodically

