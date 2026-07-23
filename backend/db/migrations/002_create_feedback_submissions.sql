-- 002_create_feedback_submissions.sql
-- CareCredits Level 4 Milestone 4 Feedback Submissions Schema

CREATE TABLE IF NOT EXISTS feedback_submissions (
    id BIGSERIAL PRIMARY KEY,
    wallet_address VARCHAR(56) NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    category VARCHAR(50) NOT NULL,
    message TEXT NULL,
    page VARCHAR(255) NULL,
    browser VARCHAR(255) NULL,
    platform VARCHAR(100) NULL,
    version VARCHAR(20) NULL,
    metadata JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feedback_wallet_address 
    ON feedback_submissions (wallet_address);

CREATE INDEX IF NOT EXISTS idx_feedback_category 
    ON feedback_submissions (category);

CREATE INDEX IF NOT EXISTS idx_feedback_rating 
    ON feedback_submissions (rating);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at 
    ON feedback_submissions (created_at DESC);
