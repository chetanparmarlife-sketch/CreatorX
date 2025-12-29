-- Migration V14: Add document_number and back_image_url to kyc_documents table

ALTER TABLE kyc_documents
ADD COLUMN document_number VARCHAR(50),
ADD COLUMN back_image_url TEXT;

COMMENT ON COLUMN kyc_documents.document_number IS 'Document number (Aadhaar: 12 digits, PAN: 10 chars, etc.)';
COMMENT ON COLUMN kyc_documents.back_image_url IS 'Back side image URL (for AADHAAR card)';

-- Add index for document number lookups
CREATE INDEX idx_kyc_documents_document_number ON kyc_documents(document_number) WHERE document_number IS NOT NULL;

