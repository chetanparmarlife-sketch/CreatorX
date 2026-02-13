-- V55: Add per-deliverable pricing
-- Nullable so existing campaigns keep equal-split behavior as fallback
ALTER TABLE campaign_deliverables ADD COLUMN price DECIMAL(15,2);
