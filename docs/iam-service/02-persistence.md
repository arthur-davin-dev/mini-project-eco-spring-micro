# Step 2: Use cases and persistence

## Application contracts

The application-service module contains one class per use case, plus the
`UserRepository`, `RoleRepository`, `PermissionRepository`, `PasswordHasher`,
and `CurrentActorProvider` output ports. The first three ports are implemented
by `iam-persistence`; password hashing and actor resolution are infrastructure
adapters.

List use cases return `PageResult<UserSummary>` and
`PageResult<RoleSummary>` as specified in the assignment. Detail and mutation
use cases return the full user/role results. `DomainDtoMapper` owns domain to
application-result mapping so the result records stay simple data types.

## Persistence design

`iam-persistence` has explicit JPA entities and Spring Data repositories for
users, roles, permissions, identities, user-role assignments,
role-permission assignments, and user-permission assignments. Every assignment
table is a first-class entity; there are no JPA `@ManyToMany` mappings.
`DomainMapper` translates between those entities and framework-free domain
objects. Reads exclude soft-deleted aggregates; assignment reads retain
revocation history and callers evaluate expiry/revocation through the domain
model. Revocation updates the matching assignment row.

Optimistic versions protect user, role, permission, and identity writes. The
adapter rejects stale aggregate versions before writing; JPA `@Version` also
protects the final database update. Assignment tables follow the PDF's
assignment columns and do not add a version column absent from that contract.

## Liquibase migration chain

The master changelog applies every SQL changeset in sequence. Changesets
001-005 create the original schema, 006 adds the normalized IAM schema and
seeds `ADMIN`, `USER`, and their permissions, 007 removes the legacy user/role/
permission tables after the modular migration, and 008 renames the normalized
tables from `iam_*` to `users`, `roles`, `permissions`, `identities`,
`user_roles`, `role_permissions`, and `user_permissions`. Changeset 008 keeps
existing rows and foreign keys. Applied changesets were left immutable.

## Verification

- `:iam-domain:iam-domain-core:test` passes the domain rule suite.
- `compileJava` passes for all IAM modules.
- PostgreSQL-backed `:iam-main:test` passes, covering user/profile persistence,
  identity linking and unlinking, soft deletion, assignment grant/revocation,
  role and direct permission assignment rows, stale user and identity writes,
  and Authorization Server integration checks.
- The complete `:iam-main:test` suite was forced to execute against a newly
  created empty PostgreSQL database. Liquibase applied the complete migration
  chain and the suite passed. The temporary verification database was removed.

No JPA relationship uses `@ManyToMany`; the assignment entities remain
independently auditable and revocable.
