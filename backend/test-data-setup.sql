-- CreatorX Phase 0 - Test Data Setup Script
-- Run this script to populate database with test data

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

-- ============================================
-- 2. CREATE USER PROFILES
-- ============================================

-- Creator 1 Profile
INSERT INTO user_profiles (user_id, full_name, avatar_url, bio, location, date_of_birth, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Test Creator One',
  'https://example.com/avatar1.jpg',
  'Fashion and lifestyle content creator with 100K+ followers',
  'Mumbai, India',
  '1995-05-15',
  NOW() - INTERVAL '30 days',
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Creator 2 Profile
INSERT INTO user_profiles (user_id, full_name, avatar_url, bio, location, date_of_birth, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Test Creator Two',
  'https://example.com/avatar2.jpg',
  'Tech reviewer and gadget enthusiast',
  'Bangalore, India',
  '1998-08-20',
  NOW() - INTERVAL '20 days',
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Brand 1 Profile
INSERT INTO user_profiles (user_id, full_name, avatar_url, bio, location, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Fashion Brand Co',
  'https://example.com/brand1-logo.jpg',
  'Leading fashion brand in India',
  'Delhi, India',
  NOW() - INTERVAL '60 days',
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Brand 2 Profile
INSERT INTO user_profiles (user_id, full_name, avatar_url, bio, location, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Tech Startup Inc',
  'https://example.com/brand2-logo.jpg',
  'Innovative tech products for modern lifestyle',
  'Bangalore, India',
  NOW() - INTERVAL '45 days',
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 3. CREATE CREATOR PROFILES
-- ============================================

INSERT INTO creator_profiles (user_id, username, category, follower_count, engagement_rate, verified, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'test_creator_one',
  'Fashion',
  100000,
  4.5,
  true,
  NOW() - INTERVAL '30 days',
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO creator_profiles (user_id, username, category, follower_count, engagement_rate, verified, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'test_creator_two',
  'Technology',
  75000,
  5.2,
  false,
  NOW() - INTERVAL '20 days',
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 4. CREATE BRAND PROFILES
-- ============================================

INSERT INTO brand_profiles (user_id, company_name, company_logo_url, industry, website, gst_number, verified, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Fashion Brand Co',
  'https://example.com/brand1-logo.jpg',
  'Fashion & Apparel',
  'https://fashionbrand.com',
  'GST123456789',
  true,
  NOW() - INTERVAL '60 days',
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO brand_profiles (user_id, company_name, company_logo_url, industry, website, gst_number, verified, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Tech Startup Inc',
  'https://example.com/brand2-logo.jpg',
  'Technology',
  'https://techstartup.com',
  'GST987654321',
  true,
  NOW() - INTERVAL '45 days',
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 5. CREATE CAMPAIGNS
-- ============================================

-- Active Campaign 1
INSERT INTO campaigns (id, brand_id, title, description, budget, platform, category, status, start_date, end_date, application_deadline, max_applicants, selected_creators_count, created_at, updated_at)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '33333333-3333-3333-3333-333333333333',
  'Summer Fashion Campaign 2024',
  'Promote our new summer collection featuring trendy outfits and accessories. Looking for fashion influencers with 50K+ followers.',
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
  'Review and showcase our latest smartphone. Need tech reviewers with expertise in mobile devices.',
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

-- Draft Campaign
INSERT INTO campaigns (id, brand_id, title, description, budget, platform, category, status, start_date, end_date, application_deadline, max_applicants, selected_creators_count, created_at, updated_at)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
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
  NOW() - INTERVAL '2 days',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. CREATE CAMPAIGN DELIVERABLES
-- ============================================

-- Campaign 1 Deliverables
INSERT INTO campaign_deliverables (id, campaign_id, title, description, type, due_date, is_mandatory, order_index, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Instagram Post', 'Create 1 Instagram post showcasing the collection', 'POST', CURRENT_DATE + INTERVAL '20 days', true, 1, NOW(), NOW()),
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Instagram Story', 'Share 3 Instagram stories featuring the products', 'STORY', CURRENT_DATE + INTERVAL '20 days', true, 2, NOW(), NOW()),
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Reel', 'Create 1 Instagram Reel with trending audio', 'REEL', CURRENT_DATE + INTERVAL '25 days', false, 3, NOW(), NOW());

-- Campaign 2 Deliverables
INSERT INTO campaign_deliverables (id, campaign_id, title, description, type, due_date, is_mandatory, order_index, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Unboxing Video', 'Create unboxing video (5-10 minutes)', 'VIDEO', CURRENT_DATE + INTERVAL '25 days', true, 1, NOW(), NOW()),
  (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Review Video', 'Detailed review video (10-15 minutes)', 'VIDEO', CURRENT_DATE + INTERVAL '30 days', true, 2, NOW(), NOW());

-- ============================================
-- 7. CREATE APPLICATIONS
-- ============================================

-- Application 1 (APPLIED)
INSERT INTO applications (id, campaign_id, creator_id, status, pitch_text, expected_timeline, applied_at, updated_at)
VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'APPLIED',
  'I have 100K followers and specialize in fashion content. I would love to collaborate on this campaign!',
  '2 weeks',
  NOW() - INTERVAL '2 days',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Application 2 (SHORTLISTED)
INSERT INTO applications (id, campaign_id, creator_id, status, pitch_text, expected_timeline, applied_at, updated_at)
VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '22222222-2222-2222-2222-222222222222',
  'SHORTLISTED',
  'Tech reviewer with 75K subscribers. I can provide detailed analysis and honest reviews.',
  '3 weeks',
  NOW() - INTERVAL '1 day',
  NOW()
) ON CONFLICT (id) DO NOTHING;

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
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'WITHDRAWAL', 10000.00, 'COMPLETED', NULL, NOW() - INTERVAL '7 days');

-- ============================================
-- 10. CREATE CONVERSATIONS
-- ============================================

INSERT INTO conversations (id, creator_id, brand_id, campaign_id, creator_unread_count, brand_unread_count, last_message_at, created_at, updated_at)
VALUES (
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  2,
  0,
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '2 days',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 11. CREATE MESSAGES
-- ============================================

INSERT INTO messages (id, conversation_id, sender_id, content, read, created_at)
VALUES 
  (gen_random_uuid(), 'ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', 'Hi! Thanks for applying to our campaign.', false, NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'Thank you! I am very excited to work with you.', false, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', 'Great! We will review your application and get back to you soon.', false, NOW() - INTERVAL '1 hour');

-- ============================================
-- 12. CREATE NOTIFICATIONS
-- ============================================

INSERT INTO notifications (id, user_id, type, title, body, data_json, read, created_at)
VALUES 
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'APPLICATION_STATUS_CHANGED', 'Application Status Updated', 'Your application for "Summer Fashion Campaign 2024" has been shortlisted', '{"applicationId": "dddddddd-dddd-dddd-dddd-dddddddddddd"}', false, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'NEW_MESSAGE', 'New Message', 'You have a new message from Fashion Brand Co', '{"conversationId": "ffffffff-ffff-ffff-ffff-ffffffffffff"}', false, NOW() - INTERVAL '1 hour'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'PAYMENT_RECEIVED', 'Payment Received', 'You received ₹10,000 for campaign completion', '{"transactionId": "...", "amount": 10000}', true, NOW() - INTERVAL '10 days');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check created data
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'User Profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'Creator Profiles', COUNT(*) FROM creator_profiles
UNION ALL
SELECT 'Brand Profiles', COUNT(*) FROM brand_profiles
UNION ALL
SELECT 'Campaigns', COUNT(*) FROM campaigns
UNION ALL
SELECT 'Campaign Deliverables', COUNT(*) FROM campaign_deliverables
UNION ALL
SELECT 'Applications', COUNT(*) FROM applications
UNION ALL
SELECT 'Wallets', COUNT(*) FROM wallets
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'Messages', COUNT(*) FROM messages
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications;

-- ============================================
-- CLEANUP SCRIPT (Run to remove test data)
-- ============================================

/*
DELETE FROM notifications WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);
DELETE FROM messages WHERE conversation_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
DELETE FROM conversations WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
DELETE FROM transactions WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);
DELETE FROM wallets WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);
DELETE FROM applications WHERE id IN (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
);
DELETE FROM campaign_deliverables WHERE campaign_id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);
DELETE FROM campaigns WHERE id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'cccccccc-cccc-cccc-cccc-cccccccccccc'
);
DELETE FROM brand_profiles WHERE user_id IN (
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);
DELETE FROM creator_profiles WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);
DELETE FROM user_profiles WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);
DELETE FROM users WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);
*/

