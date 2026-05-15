-- V71__create_product_events.sql
--
-- Stores product telemetry emitted by brand/admin dashboard JTBD workflows.
-- The endpoint is intentionally non-blocking for callers, but persistence here
-- gives enterprise health reporting real source data.

CREATE TABLE IF NOT EXISTS product_events (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    event_name VARCHAR(120) NOT NULL,
    actor_type VARCHAR(40),
    actor_id VARCHAR(80),
    route TEXT,
    source VARCHAR(80),
    sent_at TIMESTAMP,
    occurred_at TIMESTAMP NOT NULL DEFAULT NOW(),
    user_agent TEXT,
    properties_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_events_event_name ON product_events(event_name);
CREATE INDEX IF NOT EXISTS idx_product_events_actor ON product_events(actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_product_events_route ON product_events(route);
CREATE INDEX IF NOT EXISTS idx_product_events_occurred_at ON product_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_events_source_event ON product_events(source, event_name);
