# ADR-001: Use Supabase for Authentication and Storage

## Status
Accepted

## Context
CreatorX needs a scalable authentication and file storage solution. We evaluated several options:
- **Custom JWT implementation**: Full control but requires significant development time
- **AWS Cognito + S3**: Enterprise-grade but complex setup and higher costs
- **Firebase Auth + Storage**: Good for mobile but vendor lock-in
- **Supabase**: Open-source, PostgreSQL-based, built-in auth and storage

## Decision
We will use **Supabase** for:
1. **Authentication**: User registration, login, password reset, email verification
2. **Storage**: File uploads (avatars, KYC documents, deliverables, portfolio)

## Consequences

### Positive
- ✅ **Rapid development**: Pre-built auth and storage APIs
- ✅ **PostgreSQL integration**: Uses same database as backend
- ✅ **Open-source**: Can self-host if needed
- ✅ **Mobile-friendly**: Excellent React Native SDK
- ✅ **Cost-effective**: Generous free tier, reasonable pricing
- ✅ **Row-level security**: Built-in RLS policies
- ✅ **Real-time capabilities**: WebSocket support

### Negative
- ⚠️ **Vendor dependency**: Relies on Supabase service
- ⚠️ **Learning curve**: Team needs to learn Supabase APIs
- ⚠️ **Migration complexity**: Moving away would require refactoring

### Mitigation
- Keep Supabase integration abstracted in service layer
- Use Supabase's self-hosting option if vendor lock-in becomes an issue
- Maintain backup strategy for critical data

## Alternatives Considered
1. **Custom JWT + AWS S3**: More control but 3-4 weeks additional development
2. **Firebase**: Better mobile SDK but Google vendor lock-in
3. **Auth0 + Cloudinary**: More expensive, multiple vendors

## References
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)

