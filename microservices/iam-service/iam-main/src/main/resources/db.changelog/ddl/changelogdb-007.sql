--liquibase formatted sql
--changeset iam-service:007
-- Remove the pre-modular IAM schema after moving the application to iam_* tables.
DROP TABLE IF EXISTS users_roles;
DROP TABLE IF EXISTS users_permissions;
DROP TABLE IF EXISTS roles_permissions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS permissions;
