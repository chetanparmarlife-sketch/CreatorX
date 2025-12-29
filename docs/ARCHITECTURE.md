# CreatorX Architecture Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Technology Stack](#technology-stack)
4. [System Components](#system-components)
5. [Data Flow](#data-flow)
6. [Security Architecture](#security-architecture)
7. [Scalability Considerations](#scalability-considerations)

---

## System Overview

CreatorX is a three-sided marketplace platform connecting creators, brands, and admins for influencer campaign management. The system consists of:

- **React Native Mobile App** (Creator-facing)
- **Spring Boot REST API** (Backend services)
- **PostgreSQL Database** (Data persistence)
- **Redis Cache** (Performance optimization)
- **Supabase** (Authentication & File Storage)
- **Firebase** (Push Notifications)
- **WebSocket** (Real-time messaging)

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ React Native │  │  Web App     │  │  Admin Panel │     │
│  │  (Creator)   │  │  (Brand)     │  │  (Admin)    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼─────────────────┼─────────────┘
          │                  │                 │
          │ HTTPS/WSS        │ HTTPS           │ HTTPS
          │                  │                 │
┌─────────▼──────────────────▼─────────────────▼─────────────┐
│                    API Gateway Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Spring Boot REST API (Port 8080)             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │  Auth    │  │ Campaign │  │ Wallet   │          │   │
│  │  │ Service  │  │ Service  │  │ Service  │  ...     │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────┬──────────────────┬─────────────────┬─────────────┘
          │                  │                 │
          │                  │                 │
┌─────────▼──────────────────▼─────────────────▼─────────────┐
│                    Data Layer                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │PostgreSQL│  │  Redis    │  │ Supabase │  │ Firebase │    │
│  │ Database │  │  Cache    │  │ Storage  │  │   FCM    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## Architecture Patterns

### 1. Layered Architecture

The backend follows a clean layered architecture:

```
┌─────────────────────────────────────┐
│         API Layer (Controllers)     │  ← HTTP endpoints
├─────────────────────────────────────┤
│         Service Layer               │  ← Business logic
├─────────────────────────────────────┤
│         Repository Layer            │  ← Data access
├─────────────────────────────────────┤
│         Entity Layer                │  ← Domain models
└─────────────────────────────────────┘
```

**Benefits**:
- Separation of concerns
- Testability
- Maintainability
- Clear responsibilities

### 2. RESTful API Design

All endpoints follow REST principles:
- Resource-based URLs
- HTTP methods (GET, POST, PUT, DELETE)
- Stateless communication
- JSON request/response format

### 3. Repository Pattern

Data access is abstracted through repositories:
- JPA repositories for standard CRUD
- Custom queries for complex operations
- Transaction management

### 4. DTO Pattern

Data Transfer Objects (DTOs) separate API contracts from entities:
- Prevents entity exposure
- Versioning support
- Custom serialization

### 5. Service Layer Pattern

Business logic is encapsulated in services:
- Transaction management
- Business rule enforcement
- Cross-cutting concerns

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17+ | Programming language |
| Spring Boot | 3.2.x | Application framework |
| Spring Security | 6.x | Security & authentication |
| Spring Data JPA | 3.x | Data persistence |
| PostgreSQL | 15+ | Relational database |
| Redis | 7+ | Caching |
| Flyway | 9.x | Database migrations |
| WebSocket (STOMP) | - | Real-time messaging |
| Bucket4j | 8.7 | Rate limiting |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | Latest | Mobile framework |
| Expo | Latest | Development platform |
| TypeScript | 5.x | Type safety |
| Axios | Latest | HTTP client |
| AsyncStorage | Latest | Local storage |
| Firebase | Latest | Push notifications |
| WebSocket (STOMP.js) | Latest | Real-time messaging |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Local orchestration |
| Supabase | Auth & File Storage |
| Firebase Cloud Messaging | Push notifications |
| PostgreSQL | Primary database |
| Redis | Caching layer |

---

## System Components

### 1. API Layer (`creatorx-api`)

**Responsibilities**:
- HTTP request handling
- Request validation
- Response formatting
- Error handling
- Security (authentication/authorization)

**Key Components**:
- Controllers (REST endpoints)
- DTOs (Request/Response models)
- Exception handlers
- Security configuration
- WebSocket configuration

### 2. Service Layer (`creatorx-service`)

**Responsibilities**:
- Business logic implementation
- Transaction management
- Data transformation
- External service integration
- Notification sending

**Key Components**:
- Service classes (CampaignService, ApplicationService, etc.)
- Mappers (Entity ↔ DTO)
- Validators
- Notification service
- File upload service

### 3. Repository Layer (`creatorx-repository`)

**Responsibilities**:
- Data persistence
- Query execution
- Entity management
- Transaction boundaries

**Key Components**:
- JPA entities
- Repository interfaces
- Custom queries
- Entity relationships

### 4. Common Layer (`creatorx-common`)

**Responsibilities**:
- Shared utilities
- Common exceptions
- Enums
- Constants
- DTOs

---

## Data Flow

### 1. Campaign Discovery Flow

```
User → React Native App
  → GET /api/v1/campaigns
  → CampaignController
  → CampaignService
  → CampaignRepository
  → PostgreSQL
  → Response (CampaignDTO[])
  → React Native App
  → UI Display
```

### 2. Application Submission Flow

```
User → React Native App
  → POST /api/v1/applications
  → ApplicationController
  → ApplicationService
    → Validate campaign
    → Check duplicates
    → Create application
    → Send notification
  → ApplicationRepository
  → PostgreSQL
  → Response (ApplicationDTO)
  → React Native App
  → UI Update
```

### 3. Real-Time Messaging Flow

```
User A → React Native App
  → WebSocket: /app/chat.send
  → MessageController
  → MessageService
    → Save message
    → Update conversation
    → Send via WebSocket
  → PostgreSQL
  → WebSocket: /user/{userId}/queue/messages
  → User B's React Native App
  → UI Update
```

### 4. File Upload Flow

```
User → React Native App
  → POST /api/v1/storage/upload
  → StorageController
  → StorageService
    → Validate file
    → Upload to Supabase Storage
    → Save metadata
  → Supabase Storage
  → PostgreSQL (metadata)
  → Response (File URL)
  → React Native App
  → UI Update
```

---

## Security Architecture

### Authentication Flow

```
1. User registers/logs in via Supabase SDK
2. Supabase returns JWT token
3. Token stored in AsyncStorage
4. Token sent in Authorization header
5. SupabaseJwtAuthenticationFilter validates token
6. User loaded from database
7. Authentication set in SecurityContext
8. Request proceeds to controller
```

### Authorization

- **Role-Based Access Control (RBAC)**:
  - CREATOR: Can apply, submit deliverables, manage wallet
  - BRAND: Can create campaigns, manage applications
  - ADMIN: Full access

- **Resource Ownership**:
  - Users can only access their own resources
  - Ownership verified in service layer

### Security Measures

1. **JWT Token Validation**
   - Token signature verification
   - Expiration checking
   - User status validation

2. **Input Validation**
   - Bean validation annotations
   - Custom validators
   - SQL injection protection

3. **CORS Configuration**
   - Whitelisted origins
   - Credentials support

4. **Rate Limiting** (Framework ready)
   - Token bucket algorithm
   - Per-user/IP limits

5. **File Upload Security**
   - File type validation
   - Size limits
   - Virus scanning (future)

---

## Scalability Considerations

### Current Architecture

- **Stateless API**: Enables horizontal scaling
- **Database Connection Pooling**: HikariCP
- **Caching**: Redis for frequently accessed data
- **Async Processing**: For notifications

### Scaling Strategies

1. **Horizontal Scaling**
   - Multiple API instances behind load balancer
   - Stateless design supports this

2. **Database Scaling**
   - Read replicas for read-heavy operations
   - Connection pooling
   - Query optimization

3. **Caching Strategy**
   - Redis for session data
   - Cache frequently accessed campaigns
   - Cache user profiles

4. **CDN Integration** (Future)
   - Static assets
   - File downloads

5. **Message Queue** (Future)
   - Async notification processing
   - Background jobs

### Performance Optimizations

- Database indexes on frequently queried columns
- Pagination on all list endpoints
- Lazy loading for relationships
- Query optimization
- Connection pooling

---

## Deployment Architecture

### Development

```
┌─────────────┐
│   Docker    │
│   Compose   │
├─────────────┤
│ PostgreSQL  │
│   Redis     │
│ Spring Boot │
└─────────────┘
```

### Production (Future)

```
┌─────────────┐
│ Load Balancer│
├─────────────┤
│ API Instance 1│
│ API Instance 2│
│ API Instance N│
├─────────────┤
│ PostgreSQL   │
│ (Primary +   │
│  Replicas)   │
├─────────────┤
│ Redis Cluster│
└─────────────┘
```

---

## Monitoring & Observability

### Current

- Spring Boot Actuator (health, info endpoints)
- Application logging (SLF4J + Logback)
- Error tracking (via exception handlers)

### Future Enhancements

- APM (Application Performance Monitoring)
- Structured logging (JSON format)
- Distributed tracing
- Metrics collection (Prometheus)
- Alerting (PagerDuty, etc.)

---

## API Versioning

Current version: **v1**

Versioning strategy:
- URL-based versioning: `/api/v1/...`
- Backward compatibility maintained
- Deprecation notices before removal

---

## Error Handling

### Standard Error Response

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

### Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Future Architecture Enhancements

1. **Microservices** (if needed)
   - Service decomposition
   - API Gateway
   - Service mesh

2. **Event-Driven Architecture**
   - Event sourcing
   - CQRS pattern
   - Message queues

3. **GraphQL API** (optional)
   - For complex queries
   - Client-specific data fetching

---

**Last Updated**: [Date]  
**Version**: 1.0.0

