-- Migration V13: Create Supabase Storage buckets and RLS policies
-- 
-- IMPORTANT: This migration is Supabase-specific and should be run directly
-- in the Supabase SQL Editor, NOT via Flyway on a regular PostgreSQL instance.
--
-- The storage.buckets and storage.objects tables, as well as auth.uid() function,
-- are Supabase-specific and don't exist in standard PostgreSQL.
--
-- This file is kept as documentation but wrapped in a condition that will
-- skip execution on non-Supabase databases.

-- Check if this is a Supabase database by looking for the storage schema
DO $$
BEGIN
    -- Only run if storage schema exists (Supabase)
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
        
        -- Create storage buckets
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES 
            ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
            ('kyc-documents', 'kyc-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
            ('deliverables', 'deliverables', false, 104857600, ARRAY['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime']),
            ('portfolio', 'portfolio', false, 104857600, ARRAY['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime'])
        ON CONFLICT (id) DO NOTHING;

        RAISE NOTICE 'Supabase storage buckets created. RLS policies should be configured via Supabase Dashboard.';
        
    ELSE
        RAISE NOTICE 'Skipping Supabase storage migration - storage schema not found (not a Supabase database)';
    END IF;
END $$;

-- NOTE: RLS Policies for storage buckets should be configured via:
-- 1. Supabase Dashboard -> Storage -> Policies
-- 2. Or running the policy SQL directly in Supabase SQL Editor
--
-- The policies involve Supabase-specific functions like:
-- - auth.uid()
-- - storage.foldername()
-- - storage.objects table
--
-- These are not available in standard PostgreSQL and will cause Flyway to fail.
