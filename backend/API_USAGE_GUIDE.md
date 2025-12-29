# CreatorX API Usage Guide

## Table of Contents
1. [Authentication](#authentication)
2. [Common Workflows](#common-workflows)
3. [Rate Limiting](#rate-limiting)
4. [Pagination](#pagination)
5. [Error Handling](#error-handling)
6. [WebSocket Messaging](#websocket-messaging)

## Authentication

### Registration Flow

1. **Register User (Supabase)**
```bash
# Register via Supabase SDK in React Native
# Or use backend endpoint for admin user creation
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@example.com",
    "password": "SecurePass123!",
    "role": "CREATOR",
    "name": "John Doe",
    "phone": "+919876543210"
  }'
```

2. **Login (Supabase)**
```bash
# Login via Supabase SDK
# Returns: { accessToken, refreshToken, user }
```

3. **Link Supabase User to Backend**
```bash
curl -X POST http://localhost:8080/api/v1/auth/link-supabase-user \
  -H "Content-Type: application/json" \
  -d '{
    "supabaseUserId": "uuid-from-supabase",
    "email": "creator@example.com",
    "name": "John Doe",
    "role": "CREATOR"
  }'
```

4. **Access Protected Routes**
```bash
curl -X GET http://localhost:8080/api/v1/campaigns \
  -H "Authorization: Bearer <access_token>"
```

### Token Refresh

```bash
# Refresh token via Supabase SDK
# Automatically handled by React Native client
```

## Common Workflows

### Workflow 1: Creator Applies to Campaign

```bash
# 1. Browse campaigns
curl -X GET "http://localhost:8080/api/v1/campaigns?status=ACTIVE&page=0&size=20" \
  -H "Authorization: Bearer <token>"

# 2. Get campaign details
curl -X GET http://localhost:8080/api/v1/campaigns/{campaignId} \
  -H "Authorization: Bearer <token>"

# 3. Save campaign (optional)
curl -X POST http://localhost:8080/api/v1/campaigns/{campaignId}/save \
  -H "Authorization: Bearer <token>"

# 4. Submit application
curl -X POST http://localhost:8080/api/v1/applications \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "campaign-uuid",
    "pitch": "I have 100K followers and would love to collaborate...",
    "expectedTimeline": "2 weeks",
    "extraDetails": "Available immediately"
  }'

# 5. Check application status
curl -X GET http://localhost:8080/api/v1/applications \
  -H "Authorization: Bearer <token>"
```

### Workflow 2: Creator Submits Deliverable

```bash
# 1. Get active campaigns with deliverables
curl -X GET http://localhost:8080/api/v1/campaigns/active \
  -H "Authorization: Bearer <token>"

# 2. Get deliverables for campaign
curl -X GET http://localhost:8080/api/v1/deliverables?campaignId={campaignId} \
  -H "Authorization: Bearer <token>"

# 3. Upload deliverable file
curl -X POST http://localhost:8080/api/v1/storage/upload/deliverable \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/image.jpg" \
  -F "deliverableId={deliverableId}"

# 4. Submit deliverable
curl -X POST http://localhost:8080/api/v1/deliverables/{deliverableId}/submit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fileUrl": "https://storage.supabase.co/...",
    "description": "Final deliverable as requested"
  }'

# 5. Check submission status
curl -X GET http://localhost:8080/api/v1/deliverables/{deliverableId}/history \
  -H "Authorization: Bearer <token>"
```

### Workflow 3: Brand Reviews Deliverable

```bash
# 1. Get pending deliverables
curl -X GET "http://localhost:8080/api/v1/deliverables?status=SUBMITTED" \
  -H "Authorization: Bearer <token>"

# 2. Review deliverable (approve)
curl -X PUT http://localhost:8080/api/v1/deliverables/{deliverableId}/review \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED",
    "feedback": "Great work! Approved."
  }'

# OR request revision
curl -X PUT http://localhost:8080/api/v1/deliverables/{deliverableId}/review \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REVISION_REQUESTED",
    "feedback": "Please adjust the color scheme to match brand guidelines"
  }'
```

### Workflow 4: Creator Withdraws Funds

```bash
# 1. Check wallet balance
curl -X GET http://localhost:8080/api/v1/wallet \
  -H "Authorization: Bearer <token>"

# 2. Get transactions
curl -X GET "http://localhost:8080/api/v1/wallet/transactions?page=0&size=20" \
  -H "Authorization: Bearer <token>"

# 3. Add bank account (if not exists)
curl -X POST http://localhost:8080/api/v1/wallet/bank-accounts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "1234567890",
    "ifscCode": "HDFC0001234",
    "accountHolderName": "John Doe",
    "bankName": "HDFC Bank"
  }'

# 4. Request withdrawal
curl -X POST http://localhost:8080/api/v1/wallet/withdraw \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000.00,
    "bankAccountId": "bank-account-uuid"
  }'

# 5. Check withdrawal status
curl -X GET http://localhost:8080/api/v1/wallet/withdrawals \
  -H "Authorization: Bearer <token>"
```

## Rate Limiting

### Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Authentication | 5 requests | 1 minute (per IP) |
| Campaign Listing | 100 requests | 1 minute (per user) |
| File Upload | 10 requests | 1 minute (per user) |
| Other Endpoints | 100 requests | 1 minute (per user) |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Handling Rate Limits

When rate limit is exceeded, API returns:
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "status": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "path": "/api/v1/campaigns"
}
```

## Pagination

### Request Format

```
GET /api/v1/campaigns?page=0&size=20&sortBy=created_at&sortDirection=desc
```

### Response Format

```json
{
  "content": [
    {
      "id": "campaign-uuid",
      "title": "Summer Campaign",
      ...
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 150,
  "totalPages": 8,
  "first": true,
  "last": false
}
```

### Pagination Parameters

- `page`: Page number (0-indexed, default: 0)
- `size`: Items per page (default: 20, max: 100)
- `sortBy`: Field to sort by (optional)
- `sortDirection`: `asc` or `desc` (default: `desc`)

## Error Handling

### Standard Error Response

```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/campaigns",
  "details": {
    "title": "Title is required",
    "budget": "Budget must be positive"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET request successful |
| 201 | Created | POST request created resource |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Handling Best Practices

1. **Always check status code** before processing response
2. **Handle 401 errors** by refreshing token or redirecting to login
3. **Retry on 429 errors** after waiting for reset time
4. **Log 500 errors** and report to support
5. **Validate request data** before sending to avoid 400 errors

## WebSocket Messaging

### Connection

```javascript
// Connect to WebSocket
const client = new Client({
  brokerURL: 'ws://localhost:8080/ws',
  connectHeaders: {
    Authorization: 'Bearer <token>'
  }
});

client.activate();
```

### Send Message

```javascript
// Send message
client.publish({
  destination: '/app/chat.send',
  body: JSON.stringify({
    conversationId: 'conversation-uuid',
    content: 'Hello!'
  })
});
```

### Receive Messages

```javascript
// Subscribe to user queue
client.subscribe('/user/{userId}/queue/messages', (message) => {
  const data = JSON.parse(message.body);
  // Handle message
});

// Subscribe to conversation topic
client.subscribe('/topic/conversation/{conversationId}', (message) => {
  const data = JSON.parse(message.body);
  // Handle message
});
```

### Message Format

```json
{
  "id": "message-uuid",
  "conversationId": "conversation-uuid",
  "senderId": "user-uuid",
  "senderName": "John Doe",
  "content": "Hello!",
  "read": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "deliveryStatus": "sent"
}
```

## Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** (AsyncStorage in React Native)
3. **Handle token expiration** gracefully
4. **Implement retry logic** for network errors
5. **Cache responses** when appropriate
6. **Use pagination** for large datasets
7. **Validate data** before sending requests
8. **Handle errors** gracefully with user-friendly messages

