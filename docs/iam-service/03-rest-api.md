# Step 3: REST API

## Goal

Make `iam-rest-api` a thin HTTP adapter over application use cases.

## Existing implementation

Controllers and request/response DTOs currently live in
`iam-rest-api/src/main/java/kh/eco/istad/iam/rest`. Compare routes and
authorities with PDF section D before adding more endpoints.

## Implementation order

1. Depend on `iam-application-service`; do not let controllers call JPA
   repositories.
2. Complete endpoint coverage and payload validation for registration, users,
   roles, permissions, authorities, and linked identities.
3. Derive `/api/me` identity from the authenticated principal; never accept a
   caller-supplied user UUID for self-service routes.
4. Configure bearer JWT resource-server support and permission-based route
   authorization. Keep authorization server form login and protocol endpoints
   in separate filter chains.
5. Map validation, conflict, and not-found failures to RFC 9457 Problem
   Details. The API bearer-token entry point and access-denied handler also
   return Problem Details with `application/problem+json`; neither exposes
   stack traces or secrets.
6. Verify the HTTP contract and security rules with PostgreSQL-backed MockMvc
   tests, including success responses, authorization failures, validation,
   pagination, and Problem Details.

## Progress

- Implemented: permission authorities on user, role, and permission endpoints.
- Implemented: `/api/me` uses the subject UUID from the validated JWT.
- Implemented: API filter-chain handlers return 401/403 Problem Details.
- Implemented: authorization-server protocol filter chain has explicit
  precedence over the API resource-server chain.
- Implemented: Springdoc OpenAPI and Scalar are enabled. Public docs are served
  from `/scalar` and `/v3/api-docs`; request DTO records provide JSON payload
  schemas directly from controller signatures.
- Implemented: every Section D user, role, permission, assignment, registration,
  and `/api/me` route is exercised through MockMvc with a real PostgreSQL-backed
  application context.
- Implemented: request and path parameter names are explicit, so route binding
  does not depend on Java compiler parameter metadata.
- Implemented: unlinking an unknown identity maps to 404 Problem Details;
  domain rule violations remain 422.
- Verified: registration, CRUD/status transitions, assignments and revocations,
  self-service operations, list filters/pagination, 401/403 behavior, request
  validation, and not-found responses.

Open `http://localhost:9000/scalar` to browse the API and inspect request body
schemas. For registration, select `POST /api/auth/register`; `POST /login` is
the browser form endpoint and accepts form data with CSRF protection.

## Completion check

Controllers bind and validate requests, invoke use cases, and map responses.
The Section D routes and JSON examples are covered by the integration workflow;
a Postman collection is tracked separately under Step 6.
