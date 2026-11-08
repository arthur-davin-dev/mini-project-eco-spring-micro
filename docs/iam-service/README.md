# IAM service implementation guide

This guide tracks the implementation of the assignment in
`microservices/iam-service`. Work through the numbered documents in order. Each
step records its purpose, the files it owns, the design rule it protects, and
the verification expected before moving on.

## Progress

| Step | Area | Status | Document |
| --- | --- | --- | --- |
| 0 | Baseline and implementation order | Complete | [00-baseline-and-plan.md](00-baseline-and-plan.md) |
| 1 | Domain model and rules | Complete; core invariants, schema limits, and domain tests implemented and verified | [01-domain.md](01-domain.md) |
| 2 | Use cases and persistence adapters | Complete; list summary contracts aligned, all output ports implemented, assignment rows audited, PostgreSQL suite passes on existing and clean schemas | [02-persistence.md](02-persistence.md) |
| 3 | REST API and API security | Complete; Section D routes, authorization, validation, pagination, and Problem Details verified through PostgreSQL-backed MockMvc | [03-rest-api.md](03-rest-api.md) |
| 4 | Authorization Server, OIDC, DCR, federation | JDBC services, scoped OIDC claims, authority claims, protected DCR, YAML-backed Google/GitHub/Facebook/Telegram federation, and local authorization/refresh flow tests are implemented; real provider callbacks and deployment secrets remain environment setup | [04-authorization-server.md](04-authorization-server.md) |
| 5 | JTE pages and localization | A Thymeleaf login page exists; assignment-required JTE routes and English/Khmer localization remain | [05-web-and-i18n.md](05-web-and-i18n.md) |
| 6 | Integration, tests, README, Postman | Not complete | [06-verification-and-delivery.md](06-verification-and-delivery.md) |

## Dependency direction

The current source layout follows these ownership boundaries:

| Module | Source currently placed here |
| --- | --- |
| `iam-domain/iam-domain-core` | Plain Java identity, user, role, permission, and assignment rules |
| `iam-domain/iam-application-service` | Commands, results, use cases, and output ports |
| `iam-persistence` | JPA entities/repositories plus the retained legacy JPA model during migration |
| `iam-infrastructure` | Authorization Server configuration, token customization, and authentication adapters |
| `iam-rest-api` | API controllers, DTOs, validation, and API security |
| `iam-web` | Login controller and current template; JTE migration is pending |
| `iam-main` | Boot entry point, application configuration, Liquibase changelogs, and integration tests |

The top-level project is a Gradle aggregator. The old `iam-service/src/` tree
has no source files; new code should be added to the module that owns it.

## Architecture target

```text
iam-domain-core <- iam-application-service
                         ^
          +--------------+-----------------+
          |              |                 |
   iam-persistence  iam-infrastructure  iam-rest-api  iam-web
          +--------------+-----------------+
                         iam-main
```

The domain and application modules remain plain Java. Framework adapters
implement application ports; `iam-main` assembles the adapters. Authorization
Server protocol behavior belongs to Spring Authorization Server, while IAM
users, roles and permissions remain the application's domain.

## External references

- [Spring Authorization Server reference](https://docs.spring.io/spring-authorization-server/reference/overview.html)
- [Spring Authorization Server getting started](https://docs.spring.io/spring-authorization-server/reference/getting-started.html)
- [Spring Authorization Server core model](https://docs.spring.io/spring-authorization-server/reference/core-model-components.html)
- [OpenID Connect 1.0 support](https://docs.spring.io/spring-authorization-server/reference/protocol-endpoints.html)
- [Add authorities as custom claims in JWT access tokens](https://docs.spring.io/spring-authorization-server/reference/guides/how-to-custom-claims-authorities.html)
- [Customize the OpenID Connect UserInfo response](https://docs.spring.io/spring-authorization-server/reference/guides/how-to-userinfo.html)

Use the documentation version compatible with the Spring Boot/Spring Security
versions resolved by this repository. The linked overview currently describes
Spring Authorization Server 1.5.8; verify API compatibility before copying
configuration examples from a different release line.

## Configuration

Provide database and provider credentials through environment variables. The
application configuration intentionally contains no usable credentials. See
`.env.example` in this directory for the variable names; do not commit a filled
`.env` file.

## Verification

The `:iam-domain:iam-domain-core:test`, `:iam-infrastructure:test`, and
PostgreSQL-backed `:iam-main:test` suites pass. Main tests verify OIDC discovery,
registration with the one-time `client.create` token, and retrieval with the
per-client registration token. The REST integration test exercises every
Section D route family. Complete authorization-code/UserInfo flows, external
provider callbacks, and localized page tests remain.
