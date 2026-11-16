--liquibase formatted sql
--changeset iam-service:009
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_uuid UUID,
    username VARCHAR(100),
    type VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    ip_address VARCHAR(100),
    location VARCHAR(100),
    device VARCHAR(100),
    browser VARCHAR(100),
    severity VARCHAR(20) DEFAULT 'info',
    status VARCHAR(20) DEFAULT 'SUCCESS',
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_uuid ON user_activity_logs(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_activity_username ON user_activity_logs(username);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity_logs(created_at DESC);
