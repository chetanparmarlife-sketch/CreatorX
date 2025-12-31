# CreatorX Backend Documentation Index

Complete documentation for CreatorX backend API.

## 📚 Documentation Files

### Getting Started
- [README.md](./README.md) - Project overview, setup, and quick start
- [API_USAGE_GUIDE.md](./API_USAGE_GUIDE.md) - Detailed API usage with examples
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing infrastructure and examples

### API Documentation
- **Swagger UI**: http://localhost:8080/swagger-ui.html (when running)
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs
- **OpenAPI YAML**: http://localhost:8080/v3/api-docs.yaml

### Architecture
- [Architecture Decision Records](./docs/adr/) - ADRs for key decisions
  - [ADR-001: Supabase Auth & Storage](./docs/adr/ADR-001-supabase-auth-storage.md)
  - [ADR-002: Spring Boot Backend](./docs/adr/ADR-002-spring-boot-backend.md)
  - [ADR-003: WebSocket Messaging](./docs/adr/ADR-003-websocket-messaging.md)
  - [ADR-004: Razorpay Payments](./docs/adr/ADR-004-razorpay-payments.md)

### Database
- [Database Schema Documentation](./docs/database-schema.md) - ER diagram and schema details

### Testing
- [Testing Guide](./TESTING_GUIDE.md) - Unit, integration, and API tests
- [Performance Tests](./performance-tests/README.md) - Load and stress testing

### Integration
- [Supabase Auth Setup](./SUPABASE_AUTH_SETUP.md) - Authentication integration
- [File Upload Implementation](./FILE_UPLOAD_IMPLEMENTATION.md) - Storage integration
- [WebSocket Messaging](./WEBSOCKET_MESSAGING_IMPLEMENTATION.md) - Real-time messaging
- [Admin Dashboard](../ADMIN_DASHBOARD.md) - Admin workflows and endpoints
- [Brand Dashboard](../brand-dashboard/README.md) - Brand UI workflows

### Postman
- [Postman Collection](./postman/CreatorX-API.postman_collection.json) - Complete API collection
- [Environment Files](./postman/) - Dev, Staging, Production environments

## 🚀 Quick Links

### Setup
1. [Quick Start Guide](./README.md#quick-start)
2. [Environment Configuration](./README.md#configuration)
3. [Database Migrations](./README.md#database-migrations)

### Development
1. [API Usage Examples](./API_USAGE_GUIDE.md)
2. [Running Tests](./TESTING_GUIDE.md#running-tests)
3. [Swagger UI](./README.md#api-documentation)

### Deployment
1. [Docker Deployment](./README.md#deployment)
2. [Production Checklist](./README.md#production-checklist)

## 📖 API Endpoints

### Authentication
- Register, Login, Link Supabase User
- See [API_USAGE_GUIDE.md](./API_USAGE_GUIDE.md#authentication)

### Campaigns
- List, Create, Update, Delete, Save
- See [API_USAGE_GUIDE.md](./API_USAGE_GUIDE.md#common-workflows)

### Applications
- Submit, List, Withdraw
- See [API_USAGE_GUIDE.md](./API_USAGE_GUIDE.md#workflow-1-creator-applies-to-campaign)

### Deliverables
- Submit, Review, History
- See [API_USAGE_GUIDE.md](./API_USAGE_GUIDE.md#workflow-2-creator-submits-deliverable)

### Wallet
- Balance, Transactions, Withdraw
- See [API_USAGE_GUIDE.md](./API_USAGE_GUIDE.md#workflow-4-creator-withdraws-funds)

### Messaging
- WebSocket real-time messaging
- See [WEBSOCKET_MESSAGING_IMPLEMENTATION.md](./WEBSOCKET_MESSAGING_IMPLEMENTATION.md)

## 🔧 Tools

### Postman
1. Import collection: `postman/CreatorX-API.postman_collection.json`
2. Import environment: `postman/CreatorX-Dev.postman_environment.json`
3. Set `base_url` and `access_token` variables
4. Start testing!

### Swagger UI
1. Start application: `./gradlew :creatorx-api:bootRun`
2. Open: http://localhost:8080/swagger-ui.html
3. Click "Authorize" and enter JWT token
4. Explore APIs!

## 📝 Contributing

When adding new features:
1. Update API documentation in Swagger annotations
2. Add examples to [API_USAGE_GUIDE.md](./API_USAGE_GUIDE.md)
3. Update Postman collection
4. Add tests (see [TESTING_GUIDE.md](./TESTING_GUIDE.md))
5. Create ADR if architectural decision (see [docs/adr/](./docs/adr/))

## 🆘 Support

- **Email**: api@creatorx.com
- **Documentation**: https://docs.creatorx.com
- **GitHub Issues**: https://github.com/creatorx/backend/issues
