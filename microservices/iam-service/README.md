# IAM service

The IAM service follows the assignment's multi-module layout. Implementation
progress, contract decisions, and remaining work are tracked step by step in
[`docs/iam-service`](../../docs/iam-service/README.md).

## Local configuration

PostgreSQL must be available before starting the service. Configure at least:

```text
DB_URL=jdbc:postgresql://localhost:9543/db_oauth2
DB_USERNAME=iteuser
DB_PASSWORD=<local database password>
```

Set `IAM_ISSUER` when the service is reached through a non-local URL. Social
login is optional in local development; configure a provider's client ID and
secret with its matching environment variables before enabling that provider.
See [`docs/iam-service/.env.example`](../../docs/iam-service/.env.example) for
the full variable list. Never commit populated credentials.

## Build

From the repository root:

```bash
GRADLE_USER_HOME=/tmp/gradle-user-home ./gradlew -p microservices/iam-service compileJava --no-daemon
```

To package the runnable service, use `:iam-main:bootJar` from the same project
path.

The full `build` also runs database-backed tests and requires the configured
PostgreSQL service.

## Current architecture status

The domain/application modules, persistence adapters, REST controllers, and
Authorization Server JDBC services are implemented. Scoped OIDC claims, IAM
authority token claims, authorization-code + PKCE, UserInfo, confidential
refresh-token rotation, protected Dynamic Client Registration, and YAML-backed
Google/GitHub/Facebook/Telegram federation configuration are covered by local
tests. Real social provider callbacks require provider credentials and
allowlisted redirect URLs. Configure `IAM_DCR_CLIENT_SECRET` to seed the DCR
registrar and persistent RSA PEM paths for production signing keys. See the
step guide for access-token expiration and refresh behavior.
Consult the implementation guide before treating the assignment as complete.
