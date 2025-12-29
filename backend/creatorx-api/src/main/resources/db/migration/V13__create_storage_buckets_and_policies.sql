-- Migration V13: Create Supabase Storage buckets and RLS policies
-- Note: This migration should be run in Supabase SQL editor, not via Flyway
-- These are Supabase Storage-specific SQL commands

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('kyc-documents', 'kyc-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
    ('deliverables', 'deliverables', false, 104857600, ARRAY['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime']),
    ('portfolio', 'portfolio', false, 104857600, ARRAY['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime'])
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for avatars bucket (public read, authenticated write)
CREATE POLICY "Avatars are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policies for kyc-documents bucket (authenticated access only)
CREATE POLICY "Users can view their own KYC documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'kyc-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own KYC documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'kyc-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own KYC documents"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'kyc-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policies for deliverables bucket
CREATE POLICY "Creators can view their own deliverables"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'deliverables' AND
    auth.uid()::text = (
        SELECT creator_id 
        FROM deliverable_submissions 
        WHERE id::text = (storage.foldername(name))[2]
    )
);

CREATE POLICY "Creators can upload their own deliverables"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'deliverables' AND
    auth.uid()::text = (
        SELECT creator_id 
        FROM deliverable_submissions 
        WHERE id::text = (storage.foldername(name))[2]
    )
);

CREATE POLICY "Brands can view deliverables for their campaigns"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'deliverables' AND
    auth.uid()::text = (
        SELECT brand_id 
        FROM campaigns c
        JOIN deliverable_submissions ds ON ds.campaign_id = c.id
        WHERE ds.id::text = (storage.foldername(name))[2]
    )
);

-- RLS Policies for portfolio bucket
CREATE POLICY "Users can view their own portfolio"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'portfolio' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Creators can upload to their own portfolio"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'portfolio' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Creators can delete from their own portfolio"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'portfolio' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE storage.buckets IS 'Supabase Storage buckets configuration';
COMMENT ON POLICY "Avatars are publicly readable" ON storage.objects IS 'Allow public read access to avatars';
COMMENT ON POLICY "Users can upload their own avatar" ON storage.objects IS 'Users can only upload avatars to their own folder';

