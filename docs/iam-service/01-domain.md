# Step 1: Domain model and rules

## Goal

Keep authorization policy and identity lifecycle rules independent of Spring,
JPA, HTTP, and Spring Authorization Server.

## Existing implementation

Review the source under
`iam-domain/iam-domain-core/src/main/java/kh/eco/istad/iam/domain/core`.
The current model includes `User`, `Role`, `Permission`, `Identity`,
`UserRole`, `RolePermission`, and `UserPermission`. The assignment calls for
the following invariants to remain explicit in domain behavior:

- Authorities are `ROLE_<role-name>` plus `resource:action` permissions.
- Effective permissions combine active role permissions with direct grants,
  then remove direct denies.
- Inactive/deleted roles and permissions cannot be assigned; system roles and
  permissions cannot be mutated or removed.
- Assignments are revoked with actor/time/reason metadata, never physically
  deleted.
- A user cannot unlink their last sign-in method.
- User, role, permission, and identity records use soft deletion, audit fields,
  and optimistic locking.

The core models now validate the PDF's key field limits and lifecycle rules.
Sign-in eligibility checks all account states, failed logins lock at the
configured threshold, audit times cannot move backward, and successful login
events record their actor and audit timestamp. The form-login success and
failure handlers invoke `RecordLoginAttemptUseCase` so these state changes are
persisted for local password sign-ins. Social identities are unique
per active provider on a user, and a user cannot unlink their final sign-in
method. Assignment revocation validates actor, time, reason, expiry, and
restored state. Permission names also respect the `VARCHAR(100)` schema limit.

Unit tests cover direct grants and DENY precedence, permission-set immutability,
account-state checks, login lock/reset behavior, identity linking/unlinking,
schema-length boundaries, system entity immutability, assignment expiry and
revocation, and audit consistency. The module has no Spring, JPA, or web
dependencies. Domain-core tests and application-service compilation pass.

## Review tasks

1. Compare every domain field and lifecycle transition with PDF sections B.1
   through B.6 and the Liquibase tables.
2. Add persistence reconstruction methods or mappers without weakening
   invariants. Avoid public setters used only by ORM.
3. Keep identity records on the shared audited entity; assignment records use
   the assignment-specific timestamps, actor, expiry, revocation, and reason
   columns specified in B.5.
4. Add focused unit tests for boundary cases, including duplicate identity
   provider, last sign-in method, expired/revoked assignment, direct DENY
   overriding a role grant, and system entity mutation. Implemented and
   verified in `iam-domain-core`.

## Completion check

Domain tests run without Spring or a database. The domain-core and
application-service dependency graphs do not include Spring, JPA, or web
libraries. Part 1 is complete; persistence/schema integration is tracked in
Step 2.
