# Supabase Auth Implementation - Complete Guide

## ✅ What's Been Implemented

### Backend Components

1. **SupabaseJwtService** (`backend/creatorx-service/src/main/java/com/creatorx/service/SupabaseJwtService.java`)
   - Validates Supabase JWT tokens using RS256
   - Fetches public key from Supabase JWKS endpoint
   - Caches public key for 1 hour
   - Extracts user ID, email, and metadata from tokens

2. **SupabaseJwtAuthenticationFilter** (`backend/creatorx-api/src/main/java/com/creatorx/api/security/SupabaseJwtAuthenticationFilter.java`)
   - Intercepts HTTP requests
   - Validates JWT token signature
   - Loads user from database by Supabase ID
   - Sets Spring Security authentication with user role

3. **SecurityConfig** (Updated)
   - Uses `SupabaseJwtAuthenticationFilter` instead of custom JWT filter
   - CORS configured for React Native
   - Stateless session management

4. **AuthService** (`backend/creatorx-service/src/main/java/com/creatorx/service/AuthService.java`)
   - Links Supabase users to internal user profiles
   - Manages email/phone verification status
   - Updates last login timestamps

5. **AuthController** (`backend/creatorx-api/src/main/java/com/creatorx/api/controller/AuthController.java`)
   - `/api/v1/auth/register` - Register user (creates profile in Spring Boot)
   - `/api/v1/auth/link-supabase-user` - Link Supabase user to backend
   - `/api/v1/auth/me` - Get current authenticated user
   - `/api/v1/auth/verify-email` - Update email verification status
   - `/api/v1/auth/verify-phone` - Update phone verification status

6. **Database Migration** (`V11__add_supabase_id_to_users.sql`)
   - Adds `supabase_id` column to users table
   - Creates index for fast lookups

### React Native Components

1. **Supabase Client** (`src/lib/supabase.ts`)
   - Singleton Supabase client
   - AsyncStorage integration
   - Auto-refresh token
   - Session management

2. **AuthContext** (`src/context/AuthContext.tsx`)
   - Complete authentication state management
   - Sign in/up/out methods
   - Password reset
   - Auto token refresh
   - Session persistence
   - Links Supabase users to backend

3. **Example Screens**
   - `app/auth/login.supabase.tsx` - Login screen
   - `app/auth/register.supabase.tsx` - Registration screen
   - `app/_layout.supabase.tsx` - Root layout with auth protection

## 🚀 Setup Instructions

### Step 1: Backend Configuration

1. **Add Supabase configuration to `application.yml`**:
```yaml
supabase:
  url: ${SUPABASE_URL:https://your-project.supabase.co}
  jwt:
    secret: ${SUPABASE_JWT_SECRET:}
  service:
    role:
      key: ${SUPABASE_SERVICE_ROLE_KEY:}
```

2. **Set environment variables**:
```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_JWT_SECRET=your-jwt-secret  # Optional
```

3. **Run database migration**:
```bash
# Migration V11 will add supabase_id column
./gradlew :creatorx-api:bootRun
```

### Step 2: React Native Configuration

1. **Install Supabase SDK**:
```bash
npm install @supabase/supabase-js
```

2. **Configure environment** (`.env`):
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. **Update root layout** to use `AuthProvider`:
```typescript
import { AuthProvider } from '@/src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Your app */}
    </AuthProvider>
  );
}
```

### Step 3: Supabase Dashboard Setup

1. **Create Supabase project** at https://supabase.com
2. **Get your project URL and anon key** from Settings → API
3. **Configure email templates** (optional):
   - Settings → Auth → Email Templates
   - Customize verification and password reset emails

4. **Set up redirect URLs**:
   - Settings → Auth → URL Configuration
   - Add: `creatorx://`, `exp://localhost:8081`

## 📝 Usage Examples

### Login Flow

```typescript
import { useAuth } from '@/src/context/AuthContext';

function LoginScreen() {
  const { signIn, loading } = useAuth();
  
  const handleLogin = async () => {
    try {
      await signIn(email, password);
      // User is now authenticated
      // Token is stored in AsyncStorage
      // Backend will validate token on API calls
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
}
```

### Registration Flow

```typescript
const { signUp } = useAuth();

const handleRegister = async () => {
  try {
    await signUp(
      email,
      password,
      'CREATOR', // or 'BRAND'
      name,
      phone
    );
    // User created in Supabase
    // Profile linked to Spring Boot backend
    // Email verification sent (if enabled)
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### Protected Routes

```typescript
import { useAuth } from '@/src/context/AuthContext';

function ProtectedScreen() {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <LoginScreen />;
  
  return <YourContent />;
}
```

### API Calls

The API client automatically attaches the Supabase JWT token:

```typescript
// Token is automatically attached from AsyncStorage
const campaigns = await campaignService.getCampaigns();
```

## 🔐 Security Features

### 1. JWT Validation
- ✅ RS256 signature verification using Supabase public key
- ✅ Token expiration validation
- ✅ Issuer validation
- ✅ Public key caching (1 hour TTL)

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
    // Only brands can create
}
```

### 3. Password Requirements
- Minimum 8 characters (enforced by Supabase)
- Customizable in Supabase dashboard

### 4. Email Verification
- Supabase sends verification email
- Backend tracks verification status
- Can require verification before app access

### 5. Rate Limiting (Optional)
- Failed login attempt tracking
- Account lockout after 5 failed attempts
- 30-minute lockout duration

## 🔄 Authentication Flow

```
1. User enters credentials in React Native app
   ↓
2. Supabase SDK authenticates user
   ↓
3. Supabase returns JWT token
   ↓
4. Token stored in AsyncStorage
   ↓
5. React Native app makes API call
   ↓
6. API client attaches token to Authorization header
   ↓
7. SupabaseJwtAuthenticationFilter intercepts request
   ↓
8. SupabaseJwtService validates token signature
   ↓
9. User loaded from database by Supabase ID
   ↓
10. Spring Security sets authentication with user role
    ↓
11. Controller method executes with authenticated user
```

## 🧪 Testing

### Test Registration
```typescript
await signUp('test@example.com', 'password123', 'CREATOR', 'Test User');
// Check Supabase dashboard for new user
// Check Spring Boot database for linked user profile
```

### Test Login
```typescript
await signIn('test@example.com', 'password123');
// Verify token is stored
// Verify API calls work
```

### Test Token Validation
```bash
# Make API call with token
curl -H "Authorization: Bearer <supabase-jwt-token>" \
     http://localhost:8080/api/v1/auth/me
```

## 🐛 Troubleshooting

### Issue: "Invalid token signature"
- **Solution**: Check Supabase URL is correct
- Verify JWKS endpoint is accessible: `https://your-project.supabase.co/.well-known/jwks.json`
- Check network connectivity

### Issue: "User not found"
- **Solution**: Ensure user is linked via `/auth/link-supabase-user`
- Check `supabase_id` column exists in database
- Verify migration V11 ran successfully

### Issue: "Token expired"
- **Solution**: Token refresh should happen automatically
- Check `autoRefreshToken: true` in Supabase client config
- Verify refresh token is stored in AsyncStorage

### Issue: "CORS errors"
- **Solution**: Check CORS configuration in `SecurityConfig`
- Add your app's origin to allowed origins
- Verify Supabase redirect URLs are configured

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JWT Guide](https://supabase.com/docs/guides/auth/jwts)
- [Spring Security JWT](https://spring.io/guides/topicals/spring-security-architecture)

## ✅ Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database migration run (V11)
- [ ] Supabase client initialized in React Native
- [ ] AuthProvider added to app root
- [ ] Login screen implemented
- [ ] Register screen implemented
- [ ] Protected routes configured
- [ ] API client tested with Supabase token
- [ ] Email verification tested
- [ ] Password reset tested

---

**Ready to use!** Start by configuring your Supabase project and environment variables.

