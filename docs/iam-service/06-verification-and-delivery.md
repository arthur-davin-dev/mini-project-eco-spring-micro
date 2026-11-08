# Step 6: Verification and delivery

## Required checks

- Unit tests for domain rules and application use cases.
- Persistence integration tests against PostgreSQL, including Liquibase
  migrations from an empty database.
- REST MVC tests for security, validation, and RFC 9457 error payloads.
- Authorization Server tests for OAuth/OIDC flows, DCR authorization, claims,
  and token signing.
- Web tests for English/Khmer pages and CSRF-protected forms.
- A complete `./gradlew -p microservices/iam-service build` with required
  services configured.

## Delivery files

- README with architecture, prerequisites, environment variables, database
  startup, migrations, and local run instructions.
- `.env.example` containing names and safe placeholders only.
- Postman collection for registration, obtaining tokens, role/permission
  management, current profile, and error responses.
- A short architecture note explaining module boundaries, authority
  calculation, key management, and DCR limits.

Never commit live OAuth client secrets, database passwords, signing keys,
access tokens, or populated local environment files.
