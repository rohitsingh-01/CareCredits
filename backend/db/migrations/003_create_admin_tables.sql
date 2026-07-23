-- 003_create_admin_tables.sql
-- CareCredits Level 4 Milestone 5 Admin Dashboard & Multi-Pool Schema

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_user VARCHAR(100) NOT NULL DEFAULT 'admin',
    action VARCHAR(100) NOT NULL,
    target VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    metadata JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registered_pools (
    id BIGSERIAL PRIMARY KEY,
    pool_contract_id VARCHAR(56) UNIQUE NOT NULL,
    caregiver_address VARCHAR(56) NOT NULL,
    title VARCHAR(255) NOT NULL,
    goal_xlm NUMERIC(30, 7) NOT NULL DEFAULT 50.0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at 
    ON admin_audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_registered_pools_contract 
    ON registered_pools (pool_contract_id);

-- Insert Default Family Fund Pool if not present
INSERT INTO registered_pools (pool_contract_id, caregiver_address, title, goal_xlm, is_active)
VALUES (
    'CDSBFPVCUE6V7HAEMUYY5RSOXV34TIC5EKJZMBEG3J3XKXIERA2EV6CN',
    'GCX7XQS7HUZRPZIUK4GLXN2WXJKEXPUFRLH7LOKPOSZ6ZCARIYZ5GGMV',
    'CareCredits Primary Family Support Pool',
    50.0,
    TRUE
)
ON CONFLICT (pool_contract_id) DO NOTHING;
