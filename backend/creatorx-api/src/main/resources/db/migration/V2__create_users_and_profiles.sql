-- Migration V2: Create Users and Profile tables

-- Users table (core authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'CREATOR',
    status user_status NOT NULL DEFAULT 'ACTIVE',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_phone_format CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$')
);

COMMENT ON TABLE users IS 'Core user authentication and basic information';
COMMENT ON COLUMN users.email IS 'Unique email address for login';
COMMENT ON COLUMN users.phone IS 'Optional phone number for 2FA and notifications';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN users.role IS 'User role: CREATOR, BRAND, or ADMIN';
COMMENT ON COLUMN users.status IS 'Account status for access control';

-- User Profiles (common profile data)
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE user_profiles IS 'Common profile information for all user types';
COMMENT ON COLUMN user_profiles.avatar_url IS 'URL to user avatar image (stored in Supabase Storage)';

-- Creator Profiles (creator-specific data)
CREATE TABLE creator_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    follower_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5, 2) DEFAULT 0.00,
    instagram_url VARCHAR(255),
    youtube_url VARCHAR(255),
    tiktok_url VARCHAR(255),
    twitter_url VARCHAR(255),
    portfolio_items JSONB DEFAULT '[]'::jsonb,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_follower_count CHECK (follower_count >= 0),
    CONSTRAINT chk_engagement_rate CHECK (engagement_rate >= 0 AND engagement_rate <= 100)
);

COMMENT ON TABLE creator_profiles IS 'Creator-specific profile data including social media stats';
COMMENT ON COLUMN creator_profiles.username IS 'Unique creator handle/username';
COMMENT ON COLUMN creator_profiles.engagement_rate IS 'Average engagement rate percentage';
COMMENT ON COLUMN creator_profiles.portfolio_items IS 'JSON array of portfolio content URLs';

-- Brand Profiles (brand-specific data)
CREATE TABLE brand_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    gst_number VARCHAR(15) UNIQUE,
    industry VARCHAR(100),
    website VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    company_logo_url TEXT,
    company_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_gst_format CHECK (gst_number IS NULL OR gst_number ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')
);

COMMENT ON TABLE brand_profiles IS 'Brand-specific profile data including company information';
COMMENT ON COLUMN brand_profiles.gst_number IS 'GST registration number (India)';
COMMENT ON COLUMN brand_profiles.verified IS 'Brand verification status by admin';

-- KYC Documents
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    document_url TEXT NOT NULL,
    status document_status NOT NULL DEFAULT 'PENDING',
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_verification CHECK (
        (status = 'APPROVED' AND verified_by IS NOT NULL AND verified_at IS NOT NULL) OR
        (status != 'APPROVED')
    )
);

COMMENT ON TABLE kyc_documents IS 'KYC document submissions for user verification';
COMMENT ON COLUMN kyc_documents.document_url IS 'URL to document stored in Supabase Storage';
COMMENT ON COLUMN kyc_documents.verified_by IS 'Admin user who verified the document';

-- Indexes for user tables
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_creator_profiles_username ON creator_profiles(username);
CREATE INDEX idx_creator_profiles_category ON creator_profiles(category);
CREATE INDEX idx_creator_profiles_verified ON creator_profiles(verified);

CREATE INDEX idx_brand_profiles_company_name ON brand_profiles(company_name);
CREATE INDEX idx_brand_profiles_gst ON brand_profiles(gst_number) WHERE gst_number IS NOT NULL;
CREATE INDEX idx_brand_profiles_verified ON brand_profiles(verified);

CREATE INDEX idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX idx_kyc_documents_status ON kyc_documents(status);
CREATE INDEX idx_kyc_documents_type ON kyc_documents(document_type);

-- Social Links (user social media links)
CREATE TABLE social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    url VARCHAR(255) NOT NULL,
    followers VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE social_links IS 'User social media platform links';
COMMENT ON COLUMN social_links.platform IS 'Social media platform name (Instagram, YouTube, etc.)';
COMMENT ON COLUMN social_links.url IS 'URL or handle for the social media account';
COMMENT ON COLUMN social_links.followers IS 'Follower count as string (e.g., "125K")';

CREATE INDEX idx_social_links_user_id ON social_links(user_id);
CREATE INDEX idx_social_links_platform ON social_links(platform);

