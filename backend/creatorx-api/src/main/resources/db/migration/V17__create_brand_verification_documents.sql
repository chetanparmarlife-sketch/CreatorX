CREATE TABLE IF NOT EXISTS brand_verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(30) NOT NULL,
    file_url TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version BIGINT
);

CREATE INDEX IF NOT EXISTS idx_brand_verification_brand_id ON brand_verification_documents(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_verification_status ON brand_verification_documents(status);
