-- 001_create_wallet_interactions.sql
-- CareCredits Level 4 Milestone 2 Analytics Migration

CREATE TABLE IF NOT EXISTS wallet_interactions (
    id BIGSERIAL PRIMARY KEY,
    wallet_address VARCHAR(56) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    transaction_hash VARCHAR(64) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'success',
    amount NUMERIC(30, 7) NULL,
    metadata JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_interactions_address 
    ON wallet_interactions (wallet_address);

CREATE INDEX IF NOT EXISTS idx_wallet_interactions_event_type 
    ON wallet_interactions (event_type);

CREATE INDEX IF NOT EXISTS idx_wallet_interactions_created_at 
    ON wallet_interactions (created_at DESC);
