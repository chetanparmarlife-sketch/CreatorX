# CreatorX API Guide

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Request/Response Format](#requestresponse-format)
5. [Error Handling](#error-handling)
6. [Pagination](#pagination)
7. [Rate Limiting](#rate-limiting)
8. [Endpoints](#endpoints)
9. [Examples](#examples)

---

## Overview

CreatorX API is a RESTful API built with Spring Boot. All endpoints return JSON and use standard HTTP status codes.

**API Version**: v1  
**Base Path**: `/api/v1`

---

## Authentication

### JWT Bearer Token

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Getting a Token

1. Register/Login via Supabase SDK (React Native app)
2. Receive `access_token` and `refresh_token`
3. Store tokens securely
4. Include `access_token` in API requests

### Token Refresh

Tokens expire after 24 hours. Refresh using Supabase SDK:

```typescript
const { data, error } = await supabase.auth.refreshSession();
```

---

## Base URL

| Environment | Base URL |
|-------------|----------|
| Local Development | `http://localhost:8080/api/v1` |
| Development | `https://api-dev.creatorx.com/api/v1` |
| Staging | `https://api-staging.creatorx.com/api/v1` |
| Production | `https://api.creatorx.com/api/v1` |

---

## Request/Response Format

### Request Headers

```
Content-Type: application/json
Authorization: Bearer <access_token>
Accept: application/json
```

### Response Format

**Success Response**:
```json
{
  "id": "uuid",
  "title": "Campaign Title",
  "description": "Campaign description",
  ...
}
```

**Error Response**:
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/campaigns",
  "details": {
    "field": "error message"
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 204 | No Content | Request successful, no content |
| 400 | Bad Request | Validation error or invalid input |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 500 | Internal Server Error | Server error |

### Error Response Example

```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid request parameters",
  "path": "/api/v1/campaigns",
  "details": {
    "title": "Title is required",
    "budget": "Budget must be positive"
  }
}
```

---

## Pagination

List endpoints support pagination:

**Query Parameters**:
- `page` - Page number (default: 0)
- `size` - Items per page (default: 20, max: 100)

**Response Format**:
```json
{
  "items": [...],
  "page": 0,
  "size": 20,
  "total": 100,
  "totalPages": 5
}
```

**Example**:
```
GET /api/v1/campaigns?page=0&size=20
```

---

## Rate Limiting

Rate limits (framework ready, implementation pending):

| Endpoint Type | Limit |
|---------------|-------|
| Auth endpoints | 5 requests/minute |
| Search endpoints | 30 requests/minute |
| Upload endpoints | 10 requests/minute |
| Default | 100 requests/minute |

Rate limit headers (when implemented):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

---

## Endpoints

### Authentication

#### Register User
```
POST /api/v1/auth/register
```

**Request**:
```json
{
  "email": "creator@example.com",
  "password": "SecurePass123!",
  "role": "CREATOR",
  "name": "John Doe",
  "phone": "+919876543210"
}
```

**Response**: `201 Created`

---

#### Get Current User
```
GET /api/v1/auth/me
```

**Response**:
```json
{
  "userId": "uuid",
  "email": "creator@example.com",
  "role": "CREATOR",
  "supabaseUserId": "supabase-uuid"
}
```

---

### Campaigns

#### List Campaigns
```
GET /api/v1/campaigns
```

**Query Parameters**:
- `category` - Filter by category
- `platform` - Filter by platform (INSTAGRAM, YOUTUBE, etc.)
- `budgetMin` - Minimum budget
- `budgetMax` - Maximum budget
- `status` - Filter by status (ACTIVE, etc.)
- `search` - Search query
- `page` - Page number
- `size` - Page size

**Response**:
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Campaign Title",
      "description": "Description",
      "budget": 10000.00,
      "platform": "INSTAGRAM",
      "category": "Fashion",
      "status": "ACTIVE",
      "startDate": "2024-02-01",
      "endDate": "2024-02-28",
      "isSaved": false
    }
  ],
  "page": 0,
  "size": 20,
  "total": 100,
  "totalPages": 5
}
```

---

#### Get Campaign Details
```
GET /api/v1/campaigns/{id}
```

**Response**:
```json
{
  "id": "uuid",
  "title": "Campaign Title",
  "description": "Full description",
  "budget": 10000.00,
  "platform": "INSTAGRAM",
  "category": "Fashion",
  "status": "ACTIVE",
  "startDate": "2024-02-01",
  "endDate": "2024-02-28",
  "applicationDeadline": "2024-01-25",
  "maxApplicants": 10,
  "deliverables": [...],
  "isSaved": false
}
```

---

#### Search Campaigns
```
GET /api/v1/campaigns/search?query=fashion&page=0&size=20
```

**Response**: Same as List Campaigns

---

#### Save Campaign
```
POST /api/v1/campaigns/{id}/save
```

**Response**: `200 OK`

---

### Applications

#### Submit Application
```
POST /api/v1/applications
```

**Request**:
```json
{
  "campaignId": "uuid",
  "pitchText": "I'm perfect for this campaign because...",
  "availability": "Available from Feb 1-28"
}
```

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "campaignId": "uuid",
  "status": "APPLIED",
  "pitchText": "...",
  "appliedAt": "2024-01-01T12:00:00Z"
}
```

---

#### Get Applications
```
GET /api/v1/applications?page=0&size=20
```

**Response**:
```json
{
  "items": [
    {
      "id": "uuid",
      "campaignId": "uuid",
      "campaign": {
        "title": "Campaign Title"
      },
      "status": "APPLIED",
      "appliedAt": "2024-01-01T12:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "total": 10
}
```

---

#### Withdraw Application
```
DELETE /api/v1/applications/{id}
```

**Response**: `204 No Content`

---

### Wallet

#### Get Wallet Balance
```
GET /api/v1/wallet
```

**Response**:
```json
{
  "id": "uuid",
  "userId": "uuid",
  "balance": 5000.00,
  "pendingBalance": 2000.00,
  "totalEarned": 10000.00,
  "totalWithdrawn": 3000.00
}
```

---

#### Get Transactions
```
GET /api/v1/wallet/transactions?page=0&size=20
```

**Response**:
```json
{
  "items": [
    {
      "id": "uuid",
      "type": "EARNING",
      "amount": 5000.00,
      "status": "COMPLETED",
      "description": "Payment for Campaign X",
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "total": 50
}
```

---

#### Request Withdrawal
```
POST /api/v1/wallet/withdraw
```

**Request**:
```json
{
  "amount": 1000.00,
  "bankAccountId": "uuid"
}
```

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "amount": 1000.00,
  "status": "PENDING",
  "createdAt": "2024-01-01T12:00:00Z"
}
```

---

### Messaging

#### Get Conversations
```
GET /api/v1/conversations
```

**Response**:
```json
[
  {
    "id": "uuid",
    "campaign": {
      "title": "Campaign Title"
    },
    "brand": {
      "name": "Brand Name"
    },
    "lastMessage": {
      "content": "Hello!",
      "createdAt": "2024-01-01T12:00:00Z"
    },
    "unreadCount": 2
  }
]
```

---

#### Get Messages
```
GET /api/v1/conversations/{id}/messages?page=0&size=50
```

**Response**:
```json
{
  "items": [
    {
      "id": "uuid",
      "senderId": "uuid",
      "content": "Hello!",
      "read": false,
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ],
  "page": 0,
  "size": 50
}
```

---

#### Send Message
```
POST /api/v1/conversations/{id}/messages
```

**Request**:
```json
{
  "content": "Hello, I'm interested in this campaign!"
}
```

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "content": "Hello!",
  "read": false,
  "createdAt": "2024-01-01T12:00:00Z"
}
```

---

### Notifications

#### Get Notifications
```
GET /api/v1/notifications?page=0&size=20
```

**Response**:
```json
{
  "items": [
    {
      "id": "uuid",
      "type": "APPLICATION",
      "title": "Application Shortlisted",
      "message": "Your application has been shortlisted!",
      "read": false,
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ],
  "page": 0,
  "size": 20
}
```

---

#### Get Unread Count
```
GET /api/v1/notifications/unread-count
```

**Response**:
```json
{
  "count": 5
}
```

---

## Examples

### Complete Workflow: Apply to Campaign

```bash
# 1. Get campaigns
curl -X GET "http://localhost:8080/api/v1/campaigns?status=ACTIVE" \
  -H "Authorization: Bearer <token>"

# 2. Get campaign details
curl -X GET "http://localhost:8080/api/v1/campaigns/{campaignId}" \
  -H "Authorization: Bearer <token>"

# 3. Submit application
curl -X POST "http://localhost:8080/api/v1/applications" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "uuid",
    "pitchText": "I'm perfect for this campaign...",
    "availability": "Available from Feb 1-28"
  }'

# 4. Check application status
curl -X GET "http://localhost:8080/api/v1/applications" \
  -H "Authorization: Bearer <token>"
```

---

### Complete Workflow: Withdraw Earnings

```bash
# 1. Get wallet balance
curl -X GET "http://localhost:8080/api/v1/wallet" \
  -H "Authorization: Bearer <token>"

# 2. Get bank accounts
curl -X GET "http://localhost:8080/api/v1/wallet/bank-accounts" \
  -H "Authorization: Bearer <token>"

# 3. Request withdrawal
curl -X POST "http://localhost:8080/api/v1/wallet/withdraw" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000.00,
    "bankAccountId": "uuid"
  }'

# 4. Check withdrawal status
curl -X GET "http://localhost:8080/api/v1/wallet/withdrawals" \
  -H "Authorization: Bearer <token>"
```

---

## WebSocket API

### Connection

```
ws://localhost:8080/ws
```

### Authentication

Include JWT token in connection header or query parameter.

### Endpoints

**Send Message**:
```
Destination: /app/chat.send
Body: {
  "conversationId": "uuid",
  "content": "Hello!"
}
```

**Subscribe to Messages**:
```
Destination: /user/{userId}/queue/messages
```

**Message Format**:
```json
{
  "id": "uuid",
  "conversationId": "uuid",
  "senderId": "uuid",
  "content": "Hello!",
  "createdAt": "2024-01-01T12:00:00Z"
}
```

---

## Swagger UI

Interactive API documentation available at:

- Local: `http://localhost:8080/swagger-ui.html`
- Production: `https://api.creatorx.com/swagger-ui.html`

---

**Last Updated**: [Date]  
**Version**: 1.0.0

