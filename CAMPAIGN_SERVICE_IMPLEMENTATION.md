# Campaign Service Implementation - Complete Guide

## ✅ Implementation Summary

Complete Campaign Service implementation for CreatorX backend with CRUD operations, filtering, search, and saved campaigns functionality.

## 📁 Files Created

### Database
- `V12__create_saved_campaigns.sql` - Migration for saved campaigns table

### Entities
- `SavedCampaign.java` - Entity for creator saved campaigns
- `SavedCampaignRepository.java` - Repository for saved campaigns

### DTOs
- `CampaignDTO.java` - Main campaign DTO with brand info and deliverables
- `CampaignDeliverableDTO.java` - Deliverable DTO
- `CampaignCreateRequest.java` - Request DTO for creating campaigns
- `CampaignUpdateRequest.java` - Request DTO for updating campaigns
- `CampaignDeliverableCreateRequest.java` - Request DTO for deliverables
- `CampaignFilterRequest.java` - Filter parameters DTO

### Service Layer
- `CampaignService.java` - Complete service implementation with:
  - Get campaigns with filters and pagination
  - Get campaign by ID
  - Create/Update/Delete campaigns
  - Save/Unsave campaigns (favorites)
  - Get saved campaigns
  - Full-text search

### Mapper
- `CampaignMapper.java` - MapStruct mapper for entity ↔ DTO conversion

### Controller
- `CampaignController.java` - REST API endpoints with:
  - GET `/api/v1/campaigns` - List campaigns with filters
  - GET `/api/v1/campaigns/{id}` - Get campaign details
  - POST `/api/v1/campaigns` - Create campaign (Brand only)
  - PUT `/api/v1/campaigns/{id}` - Update campaign (Brand only)
  - DELETE `/api/v1/campaigns/{id}` - Delete campaign (Brand only)
  - POST `/api/v1/campaigns/{id}/save` - Save campaign (Creator only)
  - DELETE `/api/v1/campaigns/{id}/save` - Unsave campaign (Creator only)
  - GET `/api/v1/campaigns/saved` - Get saved campaigns (Creator only)
  - GET `/api/v1/campaigns/search` - Full-text search

### Tests
- `CampaignServiceTest.java` - Unit tests for service layer
- `CampaignControllerTest.java` - Integration tests for controller

## 🔧 Configuration

### Dependencies Added

**creatorx-service/build.gradle:**
```gradle
// MapStruct for DTO mapping
implementation 'org.mapstruct:mapstruct:1.5.5.Final'
annotationProcessor 'org.mapstruct:mapstruct-processor:1.5.5.Final'
```

## 🚀 Features

### 1. Campaign Listing with Filters
- Filter by: category, platform, budget range, status
- Sort by: created_at, budget, deadline
- Pagination support (default 20 items per page)
- Role-based filtering:
  - Creators: Only see ACTIVE campaigns
  - Brands: See their own campaigns + ACTIVE campaigns
  - Admins: See all campaigns

### 2. Full-Text Search
- PostgreSQL tsvector for fast search
- Searches in title and description
- Relevance ranking
- Combined with filters

### 3. CRUD Operations
- **Create**: Brands can create campaigns (status: DRAFT)
- **Read**: Role-based access control
- **Update**: Brands can update their own campaigns
- **Delete**: Brands can delete non-active campaigns

### 4. Saved Campaigns (Favorites)
- Creators can save/unsave campaigns
- Unique constraint (creator_id, campaign_id)
- Get all saved campaigns for a creator

### 5. Campaign Status Workflow
- DRAFT → ACTIVE → COMPLETED
- Status transitions validated
- Cannot delete active campaigns

## 🔐 Authorization Rules

### Creators
- ✅ View ACTIVE campaigns only
- ✅ Save/unsave campaigns
- ✅ View saved campaigns
- ❌ Create/update/delete campaigns

### Brands
- ✅ View their own campaigns (all statuses)
- ✅ View ACTIVE campaigns from other brands
- ✅ Create campaigns
- ✅ Update their own campaigns
- ✅ Delete their own campaigns (non-active only)
- ❌ Save/unsave campaigns

### Admins
- ✅ View all campaigns (all statuses)
- ✅ Full access to all operations

## 📝 API Examples

### Get Campaigns with Filters
```http
GET /api/v1/campaigns?category=Fashion&platform=INSTAGRAM&budgetMin=1000&budgetMax=50000&page=0&size=20&sortBy=budget&sortDirection=desc
```

### Create Campaign
```http
POST /api/v1/campaigns
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Summer Fashion Campaign",
  "description": "Promote summer collection",
  "budget": 50000.00,
  "platform": "INSTAGRAM",
  "category": "Fashion",
  "deliverableTypes": ["IMAGE", "VIDEO"],
  "startDate": "2024-06-01",
  "endDate": "2024-06-30",
  "applicationDeadline": "2024-05-25",
  "maxApplicants": 10,
  "deliverables": [
    {
      "title": "Instagram Post",
      "description": "Main post with product showcase",
      "type": "IMAGE",
      "dueDate": "2024-06-15",
      "isMandatory": true
    }
  ]
}
```

### Save Campaign
```http
POST /api/v1/campaigns/{id}/save
Authorization: Bearer <token>
```

### Search Campaigns
```http
GET /api/v1/campaigns/search?query=fashion&category=Fashion&page=0&size=20
```

## ✅ Validation Rules

1. **Budget**: Must be positive (> 0)
2. **Dates**: End date must be after start date
3. **Application Deadline**: Must be before or equal to end date
4. **Required Fields**: title, description, platform, category, budget, dates
5. **Deliverable Types**: At least one required
6. **Max Applicants**: Must be positive if provided

## 🧪 Testing

### Unit Tests
- Service layer business logic
- Authorization checks
- Validation rules
- Status transitions

### Integration Tests
- Controller endpoints
- Request/response mapping
- Security annotations
- Error handling

## 📊 Database Schema

### saved_campaigns Table
```sql
CREATE TABLE saved_campaigns (
    id UUID PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES users(id),
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE (creator_id, campaign_id)
);
```

## 🔄 Status Workflow

```
DRAFT → ACTIVE → COMPLETED
  ↓        ↓
  └────────┘ (can be cancelled)
```

- **DRAFT**: Campaign created but not published
- **ACTIVE**: Campaign is live and accepting applications
- **COMPLETED**: Campaign has ended
- **CANCELLED**: Campaign was cancelled (can be set from any status)

## 🎯 Next Steps

1. ✅ Run database migration V12
2. ✅ Add MapStruct dependency
3. ✅ Test API endpoints
4. ✅ Add integration with frontend
5. ⏳ Add notification when campaign goes ACTIVE
6. ⏳ Add analytics for campaign views/applications

---

**Status**: ✅ Complete and ready for testing

