-- CreatorX Seed Data for Local Development
-- This script populates the database with sample data for testing

-- ============================================
-- 1. CREATE TEST USERS
-- ============================================

-- Creator User 1
INSERT INTO users (id, email, phone, password_hash, role, status, email_verified, phone_verified, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'creator1@test.com',
  '+919876543210',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password: Test123!
  'CREATOR',
  'ACTIVE',
  true,
  true,
  NOW() - INTERVAL '30 days',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Creator User 2
INSERT INTO users (id, email, phone, password_hash, role, status, email_verified, phone_verified, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'creator2@test.com',
  '+919876543211',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'CREATOR',
  'ACTIVE',
  true,
  false,
  NOW() - INTERVAL '20 days',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Brand User 1
INSERT INTO users (id, email, phone, password_hash, role, status, email_verified, phone_verified, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'brand1@test.com',
  '+919876543212',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'BRAND',
  'ACTIVE',
  true,
  true,
  NOW() - INTERVAL '60 days',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Brand User 2
INSERT INTO users (id, email, phone, password_hash, role, status, email_verified, phone_verified, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'brand2@test.com',
  '+919876543213',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'BRAND',
  'ACTIVE',
  true,
  true,
  NOW() - INTERVAL '45 days',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Admin User
INSERT INTO users (id, email, phone, password_hash, role, status, email_verified, phone_verified, created_at, updated_at)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'admin@test.com',
  '+919876543214',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'ADMIN',
  'ACTIVE',
  true,
  true,
  NOW() - INTERVAL '90 days',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. CREATE USER PROFILES
-- ============================================

INSERT INTO user_profiles (user_id, full_name, avatar_url, bio, location, date_of_birth, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Test Creator One', 'https://i.pravatar.cc/150?img=1', 'Fashion and lifestyle content creator with 100K+ followers', 'Mumbai, India', '1995-05-15', NOW() - INTERVAL '30 days', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Test Creator Two', 'https://i.pravatar.cc/150?img=2', 'Tech reviewer and gadget enthusiast', 'Bangalore, India', '1998-08-20', NOW() - INTERVAL '20 days', NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Fashion Brand Co', 'https://i.pravatar.cc/150?img=3', 'Leading fashion brand in India', 'Delhi, India', NULL, NOW() - INTERVAL '60 days', NOW()),
  ('44444444-4444-4444-4444-444444444444', 'Tech Startup Inc', 'https://i.pravatar.cc/150?img=4', 'Innovative tech products for modern lifestyle', 'Bangalore, India', NULL, NOW() - INTERVAL '45 days', NOW()),
  ('55555555-5555-5555-5555-555555555555', 'Admin User', 'https://i.pravatar.cc/150?img=5', 'Platform Administrator', 'Mumbai, India', NULL, NOW() - INTERVAL '90 days', NOW())
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 3. CREATE CREATOR PROFILES
-- ============================================

INSERT INTO creator_profiles (user_id, username, category, follower_count, engagement_rate, verified, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'test_creator_one', 'Fashion', 100000, 4.5, true, NOW() - INTERVAL '30 days', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'test_creator_two', 'Technology', 75000, 5.2, false, NOW() - INTERVAL '20 days', NOW())
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 4. CREATE BRAND PROFILES
-- ============================================

INSERT INTO brand_profiles (user_id, company_name, company_logo_url, industry, website, gst_number, verified, created_at, updated_at)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'Fashion Brand Co', 'https://i.pravatar.cc/150?img=6', 'Fashion & Apparel', 'https://fashionbrand.com', 'GST123456789', true, NOW() - INTERVAL '60 days', NOW()),
  ('44444444-4444-4444-4444-444444444444', 'Tech Startup Inc', 'https://i.pravatar.cc/150?img=7', 'Technology', 'https://techstartup.com', 'GST987654321', true, NOW() - INTERVAL '45 days', NOW())
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 5. CREATE CAMPAIGNS
-- ============================================

-- Active Campaign 1
INSERT INTO campaigns (id, brand_id, title, description, budget, platform, category, status, start_date, end_date, application_deadline, max_applicants, selected_creators_count, created_at, updated_at)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '33333333-3333-3333-3333-333333333333',
  'Summer Fashion Campaign 2024',
  'Promote our new summer collection featuring trendy outfits and accessories. Looking for fashion influencers with 50K+ followers to showcase our latest designs.',
  50000.00,
  'INSTAGRAM',
  'Fashion',
  'ACTIVE',
  CURRENT_DATE + INTERVAL '7 days',
  CURRENT_DATE + INTERVAL '37 days',
  CURRENT_DATE + INTERVAL '5 days',
  10,
  0,
  NOW() - INTERVAL '5 days',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Active Campaign 2
INSERT INTO campaigns (id, brand_id, title, description, budget, platform, category, status, start_date, end_date, application_deadline, max_applicants, selected_creators_count, created_at, updated_at)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '44444444-4444-4444-4444-444444444444',
  'Tech Product Launch Campaign',
  'Review and showcase our latest smartphone. Need tech reviewers with expertise in mobile devices and a subscriber base of 50K+ on YouTube.',
  75000.00,
  'YOUTUBE',
  'Technology',
  'ACTIVE',
  CURRENT_DATE + INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '40 days',
  CURRENT_DATE + INTERVAL '8 days',
  5,
  0,
  NOW() - INTERVAL '3 days',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Active Campaign 3
INSERT INTO campaigns (id, brand_id, title, description, budget, platform, category, status, start_date, end_date, application_deadline, max_applicants, selected_creators_count, created_at, updated_at)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '33333333-3333-3333-3333-333333333333',
  'Festive Season Collection',
  'Celebrate the festive season with our exclusive collection. Looking for creators to create engaging content around our festive wear.',
  60000.00,
  'INSTAGRAM',
  'Fashion',
  'ACTIVE',
  CURRENT_DATE + INTERVAL '15 days',
  CURRENT_DATE + INTERVAL '45 days',
  CURRENT_DATE + INTERVAL '12 days',
  8,
  0,
  NOW() - INTERVAL '2 days',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Draft Campaign
INSERT INTO campaigns (id, brand_id, title, description, budget, platform, category, status, start_date, end_date, application_deadline, max_applicants, selected_creators_count, created_at, updated_at)
VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '33333333-3333-3333-3333-333333333333',
  'Winter Collection Campaign (Draft)',
  'Upcoming winter collection campaign - not yet published',
  60000.00,
  'INSTAGRAM',
  'Fashion',
  'DRAFT',
  CURRENT_DATE + INTERVAL '60 days',
  CURRENT_DATE + INTERVAL '90 days',
  CURRENT_DATE + INTERVAL '55 days',
  8,
  0,
  NOW() - INTERVAL '1 day',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. CREATE CAMPAIGN DELIVERABLES
-- ============================================

-- Campaign 1 Deliverables
INSERT INTO campaign_deliverables (id, campaign_id, title, description, type, due_date, is_mandatory, order_index, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Instagram Post', 'Create 1 Instagram post showcasing the collection with high-quality images', 'POST', CURRENT_DATE + INTERVAL '20 days', true, 1, NOW(), NOW()),
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Instagram Story', 'Share 3 Instagram stories featuring the products with call-to-action', 'STORY', CURRENT_DATE + INTERVAL '20 days', true, 2, NOW(), NOW()),
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Reel', 'Create 1 Instagram Reel with trending audio showcasing the collection', 'REEL', CURRENT_DATE + INTERVAL '25 days', false, 3, NOW(), NOW());

-- Campaign 2 Deliverables
INSERT INTO campaign_deliverables (id, campaign_id, title, description, type, due_date, is_mandatory, order_index, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Unboxing Video', 'Create unboxing video (5-10 minutes) showing the product features', 'VIDEO', CURRENT_DATE + INTERVAL '25 days', true, 1, NOW(), NOW()),
  (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Review Video', 'Detailed review video (10-15 minutes) covering all features and performance', 'VIDEO', CURRENT_DATE + INTERVAL '30 days', true, 2, NOW(), NOW());

-- Campaign 3 Deliverables
INSERT INTO campaign_deliverables (id, campaign_id, title, description, type, due_date, is_mandatory, order_index, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Festive Post', 'Create festive-themed Instagram post', 'POST', CURRENT_DATE + INTERVAL '30 days', true, 1, NOW(), NOW()),
  (gen_random_uuid(), 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Story Series', 'Share 5 stories showcasing different festive looks', 'STORY', CURRENT_DATE + INTERVAL '30 days', true, 2, NOW(), NOW());

-- ============================================
-- 7. CREATE APPLICATIONS
-- ============================================

INSERT INTO applications (id, campaign_id, creator_id, status, pitch_text, expected_timeline, applied_at, updated_at)
VALUES 
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'APPLIED', 'I have 100K followers and specialize in fashion content. I would love to collaborate on this campaign!', '2 weeks', NOW() - INTERVAL '2 days', NOW()),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'SHORTLISTED', 'Tech reviewer with 75K subscribers. I can provide detailed analysis and honest reviews.', '3 weeks', NOW() - INTERVAL '1 day', NOW()),
  ('11111111-1111-1111-1111-111111111112', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'SELECTED', 'Perfect match for this campaign! I have experience with festive content.', '2.5 weeks', NOW() - INTERVAL '3 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 8. CREATE WALLETS
-- ============================================

INSERT INTO wallets (user_id, balance, pending_balance, total_earned, total_withdrawn, currency, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 15000.00, 5000.00, 50000.00, 30000.00, 'INR', NOW()),
  ('22222222-2222-2222-2222-222222222222', 25000.00, 0.00, 75000.00, 50000.00, 'INR', NOW())
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 9. CREATE TRANSACTIONS
-- ============================================

INSERT INTO transactions (id, user_id, type, amount, status, campaign_id, created_at)
VALUES 
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'EARNING', 10000.00, 'COMPLETED', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '10 days'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'EARNING', 5000.00, 'PENDING', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'WITHDRAWAL', 5000.00, 'COMPLETED', NULL, NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'EARNING', 15000.00, 'COMPLETED', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '15 days'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'WITHDRAWAL', 10000.00, 'COMPLETED', NULL, NOW() - INTERVAL '7 days'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'BONUS', 1000.00, 'COMPLETED', NULL, NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 10. CREATE CONVERSATIONS
-- ============================================

INSERT INTO conversations (id, creator_id, brand_id, campaign_id, creator_unread_count, brand_unread_count, last_message_at, created_at, updated_at)
VALUES 
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, 0, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '2 days', NOW()),
  ('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 0, 1, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 11. CREATE MESSAGES
-- ============================================

INSERT INTO messages (id, conversation_id, sender_id, content, read, created_at)
VALUES 
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222223', '33333333-3333-3333-3333-333333333333', 'Hi! Thanks for applying to our campaign. We are excited to work with you!', false, NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Thank you! I am very excited to collaborate on this campaign.', false, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222223', '33333333-3333-3333-3333-333333333333', 'Great! We will review your application and get back to you soon.', false, NOW() - INTERVAL '1 hour'),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222222', 'Hello! I have some questions about the campaign requirements.', false, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333334', '44444444-4444-4444-4444-444444444444', 'Sure! Feel free to ask any questions. I am here to help.', true, NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 12. CREATE NOTIFICATIONS
-- ============================================

INSERT INTO notifications (id, user_id, type, title, body, data_json, read, created_at)
VALUES 
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'APPLICATION_STATUS_CHANGED', 'Application Status Updated', 'Your application for "Summer Fashion Campaign 2024" has been shortlisted', '{"applicationId": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"}', false, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'NEW_MESSAGE', 'New Message', 'You have a new message from Fashion Brand Co', '{"conversationId": "22222222-2222-2222-2222-222222222223"}', false, NOW() - INTERVAL '1 hour'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'PAYMENT_RECEIVED', 'Payment Received', 'You received ₹10,000 for campaign completion', '{"transactionId": "...", "amount": 10000}', true, NOW() - INTERVAL '10 days'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'APPLICATION_STATUS_CHANGED', 'Application Shortlisted', 'Your application for "Tech Product Launch Campaign" has been shortlisted', '{"applicationId": "ffffffff-ffff-ffff-ffff-ffffffffffff"}', false, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'NEW_MESSAGE', 'New Message', 'You have a new message from Tech Startup Inc', '{"conversationId": "33333333-3333-3333-3333-333333333334"}', false, NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 13. CREATE BANK ACCOUNTS (for withdrawals)
-- ============================================

INSERT INTO bank_accounts (id, user_id, account_holder_name, account_number, ifsc_code, bank_name, verified, created_at, updated_at)
VALUES 
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Test Creator One', '1234567890', 'HDFC0001234', 'HDFC Bank', true, NOW() - INTERVAL '20 days', NOW()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Test Creator Two', '9876543210', 'ICIC0005678', 'ICICI Bank', true, NOW() - INTERVAL '15 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Display summary of seeded data
DO $$
DECLARE
    user_count INTEGER;
    campaign_count INTEGER;
    application_count INTEGER;
    transaction_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO campaign_count FROM campaigns;
    SELECT COUNT(*) INTO application_count FROM applications;
    SELECT COUNT(*) INTO transaction_count FROM transactions;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Seed Data Summary';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Users: %', user_count;
    RAISE NOTICE 'Campaigns: %', campaign_count;
    RAISE NOTICE 'Applications: %', application_count;
    RAISE NOTICE 'Transactions: %', transaction_count;
    RAISE NOTICE '========================================';
END $$;

