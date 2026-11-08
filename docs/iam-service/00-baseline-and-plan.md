# Step 0: Baseline and implementation order

## Current state

- `iam-domain/iam-domain-core` contains plain Java user, role, permission,
  identity, audited assignment, and value object types.
- `iam-domain/iam-application-service` contains use cases, commands/results,
  and output ports for user, role, permission, and identity flows.
- `iam-rest-api` contains controllers, DTOs, a security configuration, and an
  exception handler.
- The old root `src/` files have been moved into their owning modules. The root
  Gradle project is now an aggregator and `iam-main` owns the Spring Boot entry
  point and application resources.
- `iam-persistence` now contains normalized JPA entity mappings and Spring Data
  repository interfaces, domain mappers, and adapters for all application
  repository ports; PostgreSQL integration verification and module runtime
  wiring are still pending.
- Liquibase changelogs now live in `iam-main/src/main/resources` and need to be
  applied to PostgreSQL; changeset 006 has been applied and tested locally.
- Social provider and database values were present in `application.yaml`.
  They are now environment-backed; configure them locally before enabling those
  providers.
- The application-service and REST API Java sources compile after aligning user
  profile commands with `UserProfile` and returning role UUID/name references.
- IAM Java compilation succeeds across the currently populated modules with
  `./gradlew -p microservices/iam-service compileJava --no-daemon`.

## Sequence

1. Compare domain invariants and schema, finish gaps, and keep the core free of
   framework dependencies.
2. Implement JPA entities and adapters for every output port, including
   assignment tables as first-class entities. Validate migrations against a
   clean PostgreSQL database.
3. Wire the REST API to use cases and secure routes with the resulting IAM
   authorities. Return RFC 9457 Problem Details consistently.
4. Move the current protocol configuration behind `iam-infrastructure` and
   assemble it in `iam-main`. Use Spring Authorization Server JDBC services,
   OIDC claims, registered client controls, and a signing key that persists
   across restarts.
5. Connect social login to the federated identity use case; do not assume every
   named provider implements the same OAuth/OIDC protocol.
6. Implement JTE views and message bundles, then finish automated verification,
   run instructions, and a Postman collection.

## Baseline verification

Run from the repository root:

```bash
GRADLE_USER_HOME=/tmp/gradle-user-home ./gradlew -p microservices/iam-service help --no-daemon
```

This confirms that Gradle configures the current IAM build and its convention
plugin. Full build verification waits until the database-backed integration
test has a PostgreSQL service available.
