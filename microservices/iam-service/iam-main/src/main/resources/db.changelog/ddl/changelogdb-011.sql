--liquibase formatted sql
--changeset iam-service:011
CREATE TABLE IF NOT EXISTS user_deactivation_requests (
    id VARCHAR(64) PRIMARY KEY,
    user_uuid UUID NOT NULL,
    username VARCHAR(100) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    feedback TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_deact_req_user ON user_deactivation_requests(user_uuid);
CREATE INDEX IF NOT EXISTS idx_deact_req_status ON user_deactivation_requests(status);
