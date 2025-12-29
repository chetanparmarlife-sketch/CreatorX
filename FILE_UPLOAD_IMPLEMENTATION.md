# File Upload Service Implementation - Complete Guide

## ✅ Implementation Summary

Complete file upload service for CreatorX using Supabase Storage with support for avatars, KYC documents, deliverables, and portfolio items.

## 📁 Files Created

### Backend

#### Services
- `FileValidationService.java` - File validation (type, size, name)
- `SupabaseStorageService.java` - Main storage service
- `SupabaseStorageClient.java` - WebClient-based Supabase Storage API client

#### DTOs
- `FileUploadResponse.java` - Upload response with file metadata
- `SignedUrlResponse.java` - Signed URL response with expiration

#### Controller
- `StorageController.java` - REST endpoints for file operations
- `StorageUploadRequest.java` - Upload request DTO

#### Database
- `V13__create_storage_buckets_and_policies.sql` - Supabase Storage setup (run in Supabase SQL editor)

### React Native

#### Components
- `FileUpload.tsx` - Reusable file upload component with progress tracking

#### Services
- `storageService.ts` - Storage API client with progress tracking

#### Types
- Added `FileUploadResponse` and `SignedUrlResponse` to `types.ts`

## 🚀 Features

### 1. File Upload Types
- **Avatars**: Images only, 5MB max, public access
- **KYC Documents**: Images/PDFs, 10MB max, authenticated access
- **Deliverables**: Images/Videos, 100MB max, authenticated access
- **Portfolio**: Images/Videos, 100MB max, authenticated access

### 2. File Validation
- ✅ File type validation (MIME type checking)
- ✅ File size limits per category
- ✅ File name sanitization
- ✅ Path traversal prevention
- ✅ Dangerous character filtering

### 3. Security
- ✅ Unique file names (UUID-based)
- ✅ Row-level security policies in Supabase
- ✅ User-specific folder structure
- ✅ Role-based access control

### 4. React Native Features
- ✅ Image picker (camera/gallery)
- ✅ Document picker
- ✅ Upload progress tracking
- ✅ Image preview
- ✅ Error handling with retry
- ✅ File size validation

## 🔧 Configuration

### Backend

**application.yml:**
```yaml
supabase:
  url: ${SUPABASE_URL:https://your-project.supabase.co}
  service:
    role:
      key: ${SUPABASE_SERVICE_ROLE_KEY:}
  storage:
    bucket:
      avatars: avatars
      kyc: kyc-documents
      deliverables: deliverables
      portfolio: portfolio
```

**Dependencies (build.gradle):**
```gradle
implementation 'org.springframework.boot:spring-boot-starter-webflux' // For WebClient
```

### Supabase Storage Setup

1. **Run SQL in Supabase SQL Editor** (`V13__create_storage_buckets_and_policies.sql`):
   - Creates 4 storage buckets
   - Sets up RLS policies
   - Configures public/authenticated access

2. **Bucket Configuration:**
   - `avatars`: Public read, authenticated write
   - `kyc-documents`: Authenticated access only
   - `deliverables`: Authenticated access, creator/brand specific
   - `portfolio`: Authenticated access, creator specific

## 📝 API Endpoints

### Upload Avatar
```http
POST /api/v1/storage/upload/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <binary>
```

### Upload KYC Document
```http
POST /api/v1/storage/upload/kyc
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <binary>
documentType: AADHAAR
```

### Upload Deliverable
```http
POST /api/v1/storage/upload/deliverable
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <binary>
deliverableId: <uuid>
```

### Upload Portfolio Item
```http
POST /api/v1/storage/upload/portfolio
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <binary>
```

### Delete File
```http
DELETE /api/v1/storage/delete?fileUrl=<url>
Authorization: Bearer <token>
```

### Generate Signed URL
```http
GET /api/v1/storage/signed-url?fileUrl=<url>&expiresIn=3600
Authorization: Bearer <token>
```

## 🎯 React Native Usage

### Basic Upload
```typescript
import { FileUpload } from '@/src/components/FileUpload';

<FileUpload
  type="avatar"
  onUploadComplete={(response) => {
    console.log('Uploaded:', response.fileUrl);
    // Update user profile with avatar URL
  }}
  onUploadError={(error) => {
    console.error('Upload failed:', error);
  }}
/>
```

### With Progress Tracking
```typescript
<FileUpload
  type="deliverable"
  deliverableId="deliverable-123"
  onUploadComplete={(response) => {
    // Handle success
  }}
  showPreview={true}
/>
```

### Using Storage Service Directly
```typescript
import { storageService } from '@/src/api/services/storageService';

const response = await storageService.uploadAvatar(
  imageUri,
  (progress) => {
    console.log(`Upload progress: ${progress}%`);
  }
);
```

## 🔐 Security Features

### 1. File Validation
- MIME type checking
- File size limits
- File name sanitization
- Path traversal prevention

### 2. Supabase RLS Policies
- Users can only access their own files
- Brands can view deliverables for their campaigns
- Public access only for avatars (read)

### 3. Unique File Names
- UUID-based file names
- Prevents file name collisions
- Prevents directory traversal

### 4. Folder Structure
```
avatars/
  users/{userId}/{filename}

kyc-documents/
  users/{userId}/{documentType}/{filename}

deliverables/
  deliverables/{deliverableId}/{filename}

portfolio/
  users/{userId}/portfolio/{filename}
```

## 📊 File Size Limits

| Type | Max Size | Allowed Types |
|------|----------|---------------|
| Avatar | 5MB | Images (JPG, PNG, WEBP, GIF) |
| KYC Document | 10MB | Images (JPG, PNG) or PDF |
| Deliverable | 100MB | Images (JPG, PNG) or Videos (MP4, MOV) |
| Portfolio | 100MB | Images (JPG, PNG) or Videos (MP4, MOV) |

## 🧪 Testing

### Backend Tests
- File validation tests
- Upload/download tests
- Signed URL generation tests
- Security policy tests

### React Native Tests
- File picker tests
- Upload progress tests
- Error handling tests
- Retry mechanism tests

## 🐛 Troubleshooting

### Issue: "File too large"
- **Solution**: Check file size limits per category
- Verify file size before upload

### Issue: "Invalid file type"
- **Solution**: Check allowed MIME types
- Verify file extension matches content type

### Issue: "Upload failed"
- **Solution**: Check Supabase Storage configuration
- Verify service role key is set
- Check network connectivity

### Issue: "Permission denied"
- **Solution**: Verify RLS policies are set up
- Check user authentication
- Verify file belongs to user

## 📚 Next Steps

1. ✅ Run Supabase Storage SQL setup
2. ✅ Configure environment variables
3. ✅ Test file uploads
4. ✅ Implement image compression (optional)
5. ✅ Add virus scanning (optional, ClamAV)
6. ✅ Add rate limiting for upload endpoints
7. ✅ Store file metadata in database

---

**Status**: ✅ Complete and ready for testing

