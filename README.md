# CreatorX - Creator Marketplace Platform

> A three-sided marketplace connecting creators, brands, and admins for influencer marketing campaigns.

[![Phase 1 Status](https://img.shields.io/badge/Phase%201-Complete-success)](PHASE1_COMPLETION_REPORT.md)
[![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%203.2-blue)](backend/README.md)
[![Frontend](https://img.shields.io/badge/Frontend-React%20Native-green)](package.json)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

---

## 🎯 Overview

CreatorX is a comprehensive platform that enables:

- **Creators** to discover campaigns, apply, submit deliverables, and earn money
- **Brands** to create campaigns, manage applications, and collaborate with creators
- **Admins** to moderate content and manage the platform

### Phase 1 Status: ✅ **COMPLETE**

Phase 1 delivers a fully functional Creator mobile application with complete backend integration.

**Key Features**:
- ✅ Campaign discovery and search
- ✅ Application submission
- ✅ Deliverable management
- ✅ Wallet and transactions
- ✅ Real-time messaging
- ✅ Push notifications
- ✅ KYC verification
- ✅ Profile management

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Documentation](#documentation)
5. [Development Setup](#development-setup)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Contributing](#contributing)

---

## 🚀 Quick Start

### Prerequisites

- **Java**: JDK 17+
- **Node.js**: 18+
- **Docker**: 20.10+ (optional, for local development)
- **PostgreSQL**: 15+ (or use Docker)
- **Redis**: 7+ (or use Docker)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start services with Docker Compose
docker-compose up -d

# Verify services
curl http://localhost:8080/actuator/health
```

### Frontend Setup

```bash
# Install dependencies
npm install

# Start Expo development server
npm run dev

# Run on iOS
npm run ios

# Run on Android
npm run android
```

See [QUICK_START.md](QUICK_START.md) for detailed setup instructions.

---

## 📁 Project Structure

```
CreatorX-1/
├── backend/                 # Spring Boot backend
│   ├── creatorx-api/       # REST API layer
│   ├── creatorx-service/   # Business logic layer
│   ├── creatorx-repository/# Data access layer
│   └── creatorx-common/    # Shared utilities
├── src/                     # React Native frontend
│   ├── api/                # API client
│   ├── components/         # UI components
│   ├── screens/            # App screens
│   └── context/            # State management
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md     # System architecture
│   ├── DATABASE.md         # Database schema
│   ├── API_GUIDE.md        # API documentation
│   ├── DEPLOYMENT.md       # Deployment guide
│   └── TROUBLESHOOTING.md  # Troubleshooting
└── README.md               # This file
```

---

## 🛠 Technology Stack

### Backend

- **Framework**: Spring Boot 3.2.x
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Authentication**: Supabase Auth + JWT
- **File Storage**: Supabase Storage
- **Real-Time**: WebSocket (STOMP)
- **Migrations**: Flyway

### Frontend

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **HTTP Client**: Axios
- **State Management**: React Context
- **Storage**: AsyncStorage
- **Push Notifications**: Firebase Cloud Messaging
- **WebSocket**: STOMP.js

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **CI/CD**: (To be configured)
- **Monitoring**: Spring Boot Actuator

---

## 📚 Documentation

### Developer Documentation

- **[Architecture](docs/ARCHITECTURE.md)** - System architecture and design patterns
- **[Database](docs/DATABASE.md)** - Database schema and ER diagrams
- **[API Guide](docs/API_GUIDE.md)** - Complete API documentation
- **[Deployment](docs/DEPLOYMENT.md)** - Deployment instructions
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

### User Guides

- **[Creator Onboarding](docs/USER_GUIDES/CREATOR_ONBOARDING.md)** - Getting started as a creator
- **[How to Apply](docs/USER_GUIDES/HOW_TO_APPLY.md)** - Applying to campaigns
- **[Submit Deliverables](docs/USER_GUIDES/HOW_TO_SUBMIT_DELIVERABLES.md)** - Submitting content
- **[Withdraw Earnings](docs/USER_GUIDES/HOW_TO_WITHDRAW.md)** - Withdrawing money

### Project Documentation

- **[Phase 1 Completion Report](PHASE1_COMPLETION_REPORT.md)** - Phase 1 deliverables and metrics
- **[Bug Fixes](BUGS_FIXED.md)** - Critical bugs fixed
- **[Integration Checklist](backend/INTEGRATION_CHECKLIST.md)** - Test checklist

### API Documentation

- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI Spec**: `http://localhost:8080/v3/api-docs`

---

## 💻 Development Setup

### Backend Development

```bash
cd backend

# Start database and Redis
docker-compose up -d postgres redis

# Run application
./gradlew :creatorx-api:bootRun

# Run tests
./gradlew test

# Check code coverage
./gradlew jacocoTestReport
```

### Frontend Development

```bash
# Install dependencies
npm install

# Start Expo
npm run dev

# Run on specific platform
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web browser
```

### Environment Variables

See [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) for environment setup.

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
./gradlew test

# Run specific test
./gradlew test --tests CampaignServiceTest

# Integration tests
./gradlew integrationTest
```

### Frontend Tests

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

### Integration Tests

See [TEST_EXECUTION_FRAMEWORK.md](TEST_EXECUTION_FRAMEWORK.md) for complete test execution guide.

**Test Results**: 118/118 integration tests passing ✅

---

## 🚢 Deployment

### Docker Deployment

```bash
cd backend

# Build image
docker build -t creatorx-backend:latest .

# Run container
docker run -d \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  creatorx-backend:latest
```

### Production Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

---

## 📊 Phase 1 Metrics

- **Integration Tests**: 118/118 passing ✅
- **Code Coverage**: 85% ✅
- **API Response Time**: < 500ms average ✅
- **Critical Bugs**: 0 ✅
- **API Endpoints**: 57 ✅

---

## 🐛 Known Limitations

### Phase 1 Limitations

- ❌ Brand Dashboard (Phase 2)
- ❌ Admin Panel (Phase 3)
- ❌ Payment Processing (Phase 4)

See [PHASE1_COMPLETION_REPORT.md](PHASE1_COMPLETION_REPORT.md) for complete list.

---

## 🔜 Roadmap

### Phase 2: Brand Dashboard MVP
- Brand web dashboard
- Campaign creation UI
- Application management
- Analytics dashboard

### Phase 3: Admin & Advanced Features
- Admin panel
- Moderation tools
- Referral program
- Advanced analytics

### Phase 4: Scale & Optimize
- Performance optimization
- Scalability improvements
- Advanced caching
- CDN integration

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow Java coding conventions
- Use TypeScript for frontend
- Write tests for new features
- Update documentation

---

## 📝 License

Proprietary - All rights reserved

---

## 📞 Support

- **Email**: support@creatorx.com
- **Documentation**: See `/docs` directory
- **Issues**: Create GitHub issue

---

## 🙏 Acknowledgments

- All beta testers for valuable feedback
- Community contributors
- Open source libraries and frameworks

---

**Status**: ✅ Phase 1 Complete  
**Version**: 1.0.0  
**Last Updated**: [Date]

---

## Quick Links

- [Phase 1 Completion Report](PHASE1_COMPLETION_REPORT.md)
- [API Documentation](docs/API_GUIDE.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Backend README](backend/README.md)

