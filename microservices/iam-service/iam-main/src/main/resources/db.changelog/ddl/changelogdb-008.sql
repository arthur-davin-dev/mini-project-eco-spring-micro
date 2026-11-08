--liquibase formatted sql
--changeset iam-service:008
-- Use concise domain table names. Existing records and foreign keys are preserved.
ALTER TABLE iam_users RENAME TO users;
ALTER TABLE iam_roles RENAME TO roles;
ALTER TABLE iam_permissions RENAME TO permissions;
ALTER TABLE iam_identities RENAME TO identities;
ALTER TABLE iam_user_roles RENAME TO user_roles;
ALTER TABLE iam_role_permissions RENAME TO role_permissions;
ALTER TABLE iam_user_permissions RENAME TO user_permissions;
