-- Migration V10: Create PostgreSQL extensions

-- Enable UUID extension (usually enabled by default in PostgreSQL 13+)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for fuzzy text search (used in V9 indexes)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable btree_gin for better index performance
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Enable pg_stat_statements for query performance monitoring (optional)
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

COMMENT ON EXTENSION "uuid-ossp" IS 'Provides functions for generating UUIDs';
COMMENT ON EXTENSION pg_trgm IS 'Provides trigram matching for fuzzy text search';
COMMENT ON EXTENSION btree_gin IS 'Provides GIN index support for btree operators';




