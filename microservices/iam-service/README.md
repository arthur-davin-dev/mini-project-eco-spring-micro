# IAM Service

Identity and Access Management service built with Spring Authorization Server. It provides user, role, and permission management, OAuth 2.1 / OpenID Connect 1.0 endpoints, social identity federation, a secured REST API, and account pages.

> **Implementation status:** The domain, application use cases, persistence adapters, REST API, Authorization Server configuration, and JTE pages with English and Khmer messages are implemented. The Postman collection and some end-to-end verification are still pending. See the [implementation guide](../../docs/iam-service/README.md) for the tracked status and detailed design decisions.

## Architecture

The service is a Gradle multi-module project. Dependencies point inward toward the domain and application layers; Spring and persistence concerns stay in adapters.

| Module | Responsibility |
| --- | --- |
| `iam-domain/iam-domain-core` | Plain Java domain model and business rules for users, roles, permissions, identities, and audited assignments |
| `iam-domain/iam-application-service` | Single-purpose use cases, commands/results, and output ports |
| `iam-persistence` | JPA entities, Spring Data repositories, and output-port implementations |
| `iam-infrastructure` | Spring Authorization Server, OAuth/OIDC configuration, token customization, and social-login adapters |
| `iam-rest-api` | REST controllers, DTO mapping, validation, API security, and Problem Details errors |
| `iam-web` | JTE account pages and English/Khmer message bundles |
| `iam-main` | Spring Boot assembly, configuration, Liquibase migrations, and integration tests |

Controllers translate request/response DTOs and invoke use cases. Use cases depend on application ports rather than Spring, JPA, or web classes. Assignment relationships are persisted as separate audited records instead of JPA `@ManyToMany` mappings. Database schema changes are managed with Liquibase; Hibernate schema generation is disabled.

## Requirements

- Java version configured by the repository Gradle build
- PostgreSQL
- Gradle wrapper (included)

## Configuration

The application reads database, issuer, key, and provider configuration from environment variables. A local `.env` file is also supported by Spring's optional config import. Start from [`docs/iam-service/.env.example`](../../docs/iam-service/.env.example); never commit real passwords, OAuth client secrets, or signing keys.

Minimum local database settings:

```dotenv
DB_URL=jdbc:postgresql://localhost:9543/db_oauth2
DB_USERNAME=iteuser
DB_PASSWORD=replace-with-your-local-password
IAM_ISSUER=http://localhost:9000
```

`DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` configure PostgreSQL. Liquibase applies the changelog on startup. `IAM_ISSUER` must be the externally visible issuer URL when deployed behind a proxy. `IAM_DCR_CLIENT_SECRET` seeds the protected Dynamic Client Registration registrar. Google, GitHub, Facebook, and Telegram login are optional; configure each provider's client ID and secret to enable it. Provider console redirect URLs must match the application's OAuth callback URL (`/login/oauth2/code/{registrationId}`).

For persistent deployments, provide `IAM_JWK_PRIVATE_KEY_PATH` and `IAM_JWK_PUBLIC_KEY_PATH` pointing to persistent RSA PEM key files. Keep signing keys and secrets outside source control and back them up according to your key rotation policy.

## Run locally

Start PostgreSQL using the repository's provided compose file, then start the application from the repository root:

```bash
docker compose -f deployment/postgres/docker-compose.yaml up -d
./gradlew -p microservices/iam-service :iam-main:bootRun --no-daemon
```

The service listens on `http://localhost:9000`. Liquibase creates/updates the schema during startup. To build the runnable JAR:

```bash
./gradlew -p microservices/iam-service :iam-main:bootJar --no-daemon
```

## REST API

The REST API is rooted at `/api`. Administrative and account endpoints require a valid bearer access token and the corresponding permission authority. Request validation errors and application errors are returned as RFC 9457 Problem Details.

| Resource | Routes |
| --- | --- |
| Registration | `POST /api/auth/register` |
| Users | `GET, POST /api/users`; `GET, DELETE /api/users/{uuid}`; `POST /api/users/{uuid}/enable`, `/disable`, `/lock`, `/unlock`; `PUT /api/users/{uuid}/password` |
| User authorities | `GET /api/users/{uuid}/authorities`; `POST, DELETE /api/users/{uuid}/roles[/{roleUuid}]`; `POST, DELETE /api/users/{uuid}/permissions[/{permissionUuid}]` |
| User identities | `GET /api/users/{uuid}/identities`; `DELETE /api/users/{uuid}/identities/{identityUuid}` |
| Current user | `GET /api/me`; `PUT /api/me/password`; `GET /api/me/identities`; `DELETE /api/me/identities/{identityUuid}` |
| Roles | `GET, POST /api/roles`; `GET, DELETE /api/roles/{uuid}`; `POST /api/roles/{uuid}/activate`, `/deactivate`; `POST, DELETE /api/roles/{uuid}/permissions[/{permissionUuid}]` |
| Permissions | `GET, POST /api/permissions`; `GET, DELETE /api/permissions/{uuid}`; `POST /api/permissions/{uuid}/activate`, `/deactivate` |

`GET /api/users` and the role/permission list routes support pagination. OpenAPI documentation is available at `/v3/api-docs` and Swagger UI at `/swagger-ui/index.html`.

## OAuth 2.1 and OpenID Connect

Spring Authorization Server supplies the authorization protocol endpoints. The service persists registered clients, authorizations, and consent in JDBC-backed stores. It supports authorization code with PKCE, OIDC discovery and UserInfo, JWT access tokens containing IAM roles and permissions, refresh-token rotation for confidential clients, and protected Dynamic Client Registration.

Common endpoints on the local issuer:

| Purpose | Endpoint |
| --- | --- |
| OIDC discovery | `/.well-known/openid-configuration` |
| Authorization | `/oauth2/authorize` |
| Token | `/oauth2/token` |
| JSON Web Key Set | `/oauth2/jwks` |
| UserInfo | `/userinfo` |
| Dynamic client registration | `/connect/register` |

Social login supports Google, GitHub, Facebook, and Telegram when credentials are configured. A successful login finds or provisions the local IAM user and links the provider identity. Real provider callbacks require provider-side application registration and reachable callback URLs.

## Web pages and localization

The JTE pages include login, registration, profile, profile editing, password change, linked identities, connected applications, and consent. Message bundles are provided in English (`messages.properties`) and Khmer (`messages_km.properties`). Locale selection is handled by the web module.

## Verification

Run the domain unit tests:

```bash
./gradlew -p microservices/iam-service :iam-domain:iam-domain-core:test --no-daemon
```

The main integration tests require a running PostgreSQL database and the `DB_*` environment variables. The implementation guide records the current verification coverage and remaining delivery work. A Postman collection is not included yet.

## Further documentation

- [Implementation guide and progress](../../docs/iam-service/README.md)
- [Domain model](../../docs/iam-service/01-domain.md)
- [Use cases and persistence](../../docs/iam-service/02-persistence.md)
- [REST API](../../docs/iam-service/03-rest-api.md)
- [Authorization Server and federation](../../docs/iam-service/04-authorization-server.md)
- [Web pages and localization](../../docs/iam-service/05-web-and-i18n.md)
- [Verification and delivery checklist](../../docs/iam-service/06-verification-and-delivery.md)
