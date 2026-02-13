-- V57: Add status tracking and retry support to webhook_events
ALTER TABLE webhook_events ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PROCESSED';
ALTER TABLE webhook_events ADD COLUMN error_message TEXT;
ALTER TABLE webhook_events ADD COLUMN retry_count INTEGER NOT NULL DEFAULT 0;

-- Index for retry scheduler to find failed webhooks efficiently
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
