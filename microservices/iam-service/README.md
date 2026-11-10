# IAM Service

An Identity and Access Management (IAM) service built with Spring Authorization Server. It manages users, roles, permissions, and linked identities, and provides OAuth 2.1 / OpenID Connect 1.0, a secured REST API, social login, and localized account pages.

This project is organized as a Gradle multi-module application. The IAM domain and application use cases do not depend on Spring Authorization Server, JPA, or web frameworks. Framework-specific behavior is implemented in adapter modules and assembled by `iam-main`.

## Assignment objective

Build an IAM service in which `User`, `Role`, and `Permission` are the core domain concepts. Expose domain behavior through single-responsibility use cases. Use Spring Authorization Server as an OAuth/OIDC adapter, alongside Dynamic Client Registration (DCR), federated social login, a secured REST API, and JTE pages in English and Khmer.

## Architecture and module responsibilities

| Module | Responsibility |
| --- | --- |
| `iam-domain/iam-domain-core` | Framework-free domain model: users, roles, permissions, identities, and audited assignment models |
| `iam-domain/iam-application-service` | One class per use case, commands/results, and output ports |
| `iam-persistence` | Spring Data JPA entities, repositories, mappings, and output-port adapters |
| `iam-infrastructure` | Spring Authorization Server, OAuth/OIDC, token claims, DCR, and social-login adapters |
| `iam-rest-api` | REST controllers, DTO mapping, validation, API security, and RFC 9457 Problem Details |
| `iam-web` | JTE account pages and English/Khmer localization |
| `iam-main` | Spring Boot application assembly, configuration, Liquibase migrations, and integration tests |

Dependencies point inward: domain core has no framework dependencies; application service depends on domain core; adapters implement application ports; `iam-main` brings the modules together. Controllers should map DTOs and call use cases, not access repositories directly. Each user-role, role-permission, and user-permission assignment is its own audited persistence entity; do not use JPA `@ManyToMany`.

## Implementation requirements

### Part 1: Project structure and core domain (+15)

- Use the modules and dependency boundaries described above.
- Implement `User`, `Role`, `Permission`, `Identity`, and the three audited assignment models in `iam-domain-core`.

### Part 2: Use cases and persistence (+15)

- Define single-purpose use cases and output ports in `iam-application-service`.
- Implement the ports with Spring Data JPA in `iam-persistence`.
- Map every assignment table as a separate entity, without `@ManyToMany`.
- Use Liquibase for every database schema change.

### Part 3: REST API (+15)

- Expose the use cases through the endpoints and payloads in assignment Section D, in `iam-rest-api`.
- Secure the API with the service's JWT access tokens and permission authorities.
- Return errors using RFC 9457 Problem Details.

### Part 4: Authorization Server adapter (+20)

- Configure `JdbcRegisteredClientRepository`, `JdbcOAuth2AuthorizationService`, and `JdbcOAuth2AuthorizationConsentService` in `iam-infrastructure`.
- Map OIDC claims and include roles and permissions in access tokens.
- Enable Dynamic Client Registration with protected registrar access.
- Support Google, GitHub, Facebook, and Telegram login through `FindOrProvisionFederatedUserUseCase`.

### Part 5: JTE and internationalization (+15)

- Implement the account pages from assignment Section F in `iam-web` using JTE.
- Provide English (`en`) and Khmer (`km`) messages.

### Code quality and delivery (+20)

- Keep domain and application modules free of Spring Authorization Server, JPA, and web dependencies.
- Use one class per use case; keep controllers focused on DTO mapping and use-case calls.
- Apply soft deletion, auditing, and optimistic locking throughout the applicable models.
- Load secrets only from environment variables; do not commit secrets or populated local environment files.
- Provide unit and integration tests, this README, and a Postman collection.

## Implementation status

The domain, use cases, persistence adapters, REST API, and Authorization Server flows have substantial implementation and verification. The implementation tracker currently lists JTE migration and the final delivery/verification work as incomplete. See the [IAM implementation guide](../../docs/iam-service/README.md) for the current step-by-step status and [delivery checklist](../../docs/iam-service/06-verification-and-delivery.md). Update this section as remaining work is completed.

## Requirements

- Java version configured by the repository Gradle build
- PostgreSQL
- Included Gradle wrapper
- Docker Compose for the repository's local PostgreSQL setup (optional if PostgreSQL is already running)

## Configuration

Start with [`docs/iam-service/.env.example`](../../docs/iam-service/.env.example). The application reads database, issuer, signing-key, DCR, and social-provider configuration from environment variables. A local `.env` file is supported by Spring's optional config import; keep real values out of source control.

Minimum database and issuer configuration:

```dotenv
DB_URL=jdbc:postgresql://localhost:9543/db_oauth2
DB_USERNAME=iteuser
DB_PASSWORD=replace-with-your-local-password
IAM_ISSUER=http://localhost:9000
```

Liquibase applies migrations at startup. Set `IAM_DCR_CLIENT_SECRET` to seed the protected DCR registrar. Google, GitHub, Facebook, and Telegram login require provider application credentials in environment variables and matching provider callback URLs (`/login/oauth2/code/{registrationId}`). For persistent deployments, configure `IAM_JWK_PRIVATE_KEY_PATH` and `IAM_JWK_PUBLIC_KEY_PATH` with persistent RSA PEM key files. Never commit passwords, OAuth secrets, signing keys, or access tokens.

## Run locally

From the repository root, start PostgreSQL and run the application:

```bash
docker compose -f deployment/postgres/docker-compose.yaml up -d
./gradlew -p microservices/iam-service :iam-main:bootRun --no-daemon
```

The service is available at `http://localhost:9000`. Build the runnable JAR with:

```bash
./gradlew -p microservices/iam-service :iam-main:bootJar --no-daemon
```

## API and protocol endpoints

The REST API is rooted at `/api`. Administrative and account routes require a bearer access token with the required permission authority. OpenAPI documentation is generated from the REST controllers and request/response DTOs. With the service running locally, use:

| What | URL |
| --- | --- |
| Interactive API reference (Scalar) | [http://localhost:9000/scalar](http://localhost:9000/scalar) |
| OpenAPI document (JSON) | [http://localhost:9000/v3/api-docs](http://localhost:9000/v3/api-docs) |
| Swagger UI | [http://localhost:9000/swagger-ui/index.html](http://localhost:9000/swagger-ui/index.html) |

In Scalar or Swagger UI, use **Authorize** and enter a valid JWT access token to call protected `/api/**` endpoints. `POST /api/auth/register` is public. These documentation URLs are local examples; replace `localhost:9000` with the deployed IAM base URL when accessing another environment.

| Resource | Routes |
| --- | --- |
| Registration | `POST /api/auth/register` |
| Users | `GET, POST /api/users`; `GET, DELETE /api/users/{uuid}`; `POST /api/users/{uuid}/enable`, `/disable`, `/lock`, `/unlock`; `PUT /api/users/{uuid}/password` |
| User authorities | `GET /api/users/{uuid}/authorities`; assign/revoke roles and permissions under `/api/users/{uuid}/roles` and `/permissions` |
| User identities | `GET /api/users/{uuid}/identities`; unlink with `DELETE /api/users/{uuid}/identities/{identityUuid}` |
| Current user | `GET /api/me`; `PUT /api/me/password`; view or unlink identities under `/api/me/identities` |
| Roles | `GET, POST /api/roles`; `GET, DELETE /api/roles/{uuid}`; activate/deactivate and assign/revoke permissions under `/api/roles/{uuid}` |
| Permissions | `GET, POST /api/permissions`; `GET, DELETE /api/permissions/{uuid}`; activate/deactivate under `/api/permissions/{uuid}` |

List routes support pagination. Validation and application errors use RFC 9457 Problem Details.

| Purpose | Endpoint |
| --- | --- |
| OIDC discovery | `/.well-known/openid-configuration` |
| Authorization | `/oauth2/authorize` |
| Token | `/oauth2/token` |
| JSON Web Key Set | `/oauth2/jwks` |
| UserInfo | `/userinfo` |
| Dynamic Client Registration | `/connect/register` |

Spring Authorization Server persists registered clients, authorizations, and consent through JDBC-backed services. DCR is protected by a registrar token. Persistent signing keys should be configured for deployments so tokens remain verifiable across restarts. Social login is enabled only when its provider credentials and callback configuration are supplied.

## Web pages and localization

The target web experience uses JTE for login, registration, consent, profile, password, linked accounts, and connected applications. English and Khmer message bundles provide `en` and `km` localization. Refer to the [web and i18n implementation notes](../../docs/iam-service/05-web-and-i18n.md) for current implementation status and routes.

## Verification and delivery

Run the domain unit tests:

```bash
./gradlew -p microservices/iam-service :iam-domain:iam-domain-core:test --no-daemon
```

PostgreSQL-backed integration tests require a running database and the `DB_*` environment variables. Follow the [verification and delivery checklist](../../docs/iam-service/06-verification-and-delivery.md) for migration, REST, OAuth/OIDC, localization, and final build checks. The Postman collection is a required delivery artifact; check the implementation guide for its current availability.

## Further documentation

- [Implementation guide and progress](../../docs/iam-service/README.md)
- [Domain model](../../docs/iam-service/01-domain.md)
- [Use cases and persistence](../../docs/iam-service/02-persistence.md)
- [REST API](../../docs/iam-service/03-rest-api.md)
- [Authorization Server and federation](../../docs/iam-service/04-authorization-server.md)
- [Web pages and localization](../../docs/iam-service/05-web-and-i18n.md)
- [Verification and delivery checklist](../../docs/iam-service/06-verification-and-delivery.md)
