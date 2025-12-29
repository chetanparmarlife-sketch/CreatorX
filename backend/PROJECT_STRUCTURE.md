# CreatorX Backend - Project Structure

## Overview

Multi-module Spring Boot application organized by layers (API, Service, Repository, Common).

## Directory Structure

```
backend/
├── creatorx-api/                          # API Layer
│   ├── build.gradle
│   └── src/main/
│       ├── java/com/creatorx/api/
│       │   ├── CreatorXApplication.java   # Main application class
│       │   ├── config/
│       │   │   ├── SecurityConfig.java    # Spring Security + CORS
│       │   │   └── OpenApiConfig.java     # Swagger/OpenAPI config
│       │   ├── security/
│       │   │   └── JwtAuthenticationFilter.java
│       │   └── controller/
│       │       ├── HealthController.java
│       │       └── exception/
│       │           └── GlobalExceptionHandler.java
│       └── resources/
│           ├── application.yml            # Main config
│           ├── application-dev.yml        # Dev profile
│           ├── application-staging.yml   # Staging profile
│           ├── application-prod.yml      # Prod profile
│           └── db/migration/              # Flyway migrations
│
├── creatorx-service/                      # Service Layer
│   ├── build.gradle
│   └── src/main/java/com/creatorx/service/
│       ├── JwtService.java                # JWT token management
│       ├── UserService.java               # User business logic
│       ├── CacheService.java              # Cache utilities
│       └── config/
│           └── CacheConfig.java           # Redis cache config
│
├── creatorx-repository/                  # Data Access Layer
│   ├── build.gradle
│   └── src/main/java/com/creatorx/
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── CampaignRepository.java
│       │   ├── CampaignApplicationRepository.java
│       │   ├── WalletRepository.java
│       │   ├── TransactionRepository.java
│       │   ├── ConversationRepository.java
│       │   └── NotificationRepository.java
│       └── entity/
│           ├── BaseEntity.java            # Base entity with audit fields
│           ├── User.java                   # User entity
│           ├── SocialLink.java
│           ├── Campaign.java
│           ├── CampaignDeliverable.java
│           ├── CampaignApplication.java
│           ├── ActiveCampaign.java
│           ├── Deliverable.java
│           ├── Transaction.java
│           ├── Wallet.java
│           ├── Message.java
│           ├── Conversation.java
│           └── Notification.java
│
├── creatorx-common/                       # Shared Module
│   ├── build.gradle
│   └── src/main/java/com/creatorx/common/
│       ├── enums/
│       │   ├── UserRole.java
│       │   ├── CampaignStatus.java
│       │   ├── ApplicationStatus.java
│       │   ├── DeliverableStatus.java
│       │   ├── PaymentStatus.java
│       │   ├── TransactionType.java
│       │   └── NotificationType.java
│       ├── exception/
│       │   ├── ErrorResponse.java
│       │   ├── BusinessException.java
│       │   ├── ResourceNotFoundException.java
│       │   └── UnauthorizedException.java
│       └── util/
│           └── Constants.java
│
├── build.gradle                           # Root build file
├── settings.gradle                        # Gradle module settings
├── gradle.properties                      # Gradle properties
├── gradlew                                # Gradle wrapper (Unix)
├── gradlew.bat                            # Gradle wrapper (Windows)
├── Dockerfile                              # Application container
├── docker-compose.yml                     # Docker services
├── env.example                            # Environment variables template
├── README.md                              # Main documentation
├── SETUP.md                               # Setup instructions
└── PROJECT_STRUCTURE.md                   # This file
```

## Module Dependencies

```
creatorx-api
  ├── creatorx-service
  │     ├── creatorx-repository
  │     │     └── creatorx-common
  │     └── creatorx-common
  └── creatorx-common
```

## Key Components

### API Module (`creatorx-api`)
- **Purpose**: REST API endpoints, security, configuration
- **Key Files**:
  - `SecurityConfig`: JWT authentication, CORS
  - `GlobalExceptionHandler`: Centralized error handling
  - `HealthController`: Health check endpoint
  - `OpenApiConfig`: Swagger documentation

### Service Module (`creatorx-service`)
- **Purpose**: Business logic, JWT service, caching
- **Key Files**:
  - `JwtService`: Token generation and validation
  - `UserService`: User management logic
  - `CacheConfig`: Redis cache configuration

### Repository Module (`creatorx-repository`)
- **Purpose**: Data access layer
- **Key Files**:
  - JPA Entities: Domain models
  - Repositories: Data access interfaces

### Common Module (`creatorx-common`)
- **Purpose**: Shared utilities, enums, exceptions
- **Key Files**:
  - Enums: Domain enumerations
  - Exceptions: Custom exception classes
  - Constants: Application constants

## Configuration Files

### Application Properties
- `application.yml`: Base configuration
- `application-dev.yml`: Development profile
- `application-staging.yml`: Staging profile
- `application-prod.yml`: Production profile

### Docker
- `Dockerfile`: Multi-stage build for application
- `docker-compose.yml`: Orchestration (Postgres, Redis, App)

## Database Schema

Entities are defined as JPA entities in `creatorx-repository`. The schema is managed by:
1. JPA/Hibernate (for development)
2. Flyway migrations (for production)

## Security Flow

1. Client sends request with JWT token in `Authorization` header
2. `JwtAuthenticationFilter` intercepts request
3. Token is validated by `JwtService`
4. User is loaded from database
5. Authentication is set in SecurityContext
6. Request proceeds to controller

## API Endpoints Structure

```
/api/v1/
  ├── /auth/              # Authentication endpoints
  ├── /campaigns/         # Campaign management
  ├── /users/             # User management
  ├── /wallet/            # Wallet operations
  ├── /transactions/      # Transaction history
  ├── /messages/          # Messaging
  └── /notifications/     # Notifications
```

## Next Steps

1. Implement authentication endpoints (`/api/v1/auth/**`)
2. Add campaign CRUD endpoints
3. Implement wallet and transaction APIs
4. Add messaging endpoints
5. Configure Razorpay integration
6. Add comprehensive tests




