# Step 4: Spring Authorization Server adapter

## Goal

Use Spring Authorization Server for OAuth 2.1 and OpenID Connect protocol
behavior while delegating user authentication and IAM claims to application
ports.

## Implementation order

1. Put authorization server configuration in `iam-infrastructure`; keep
   `iam-domain` free of Spring Authorization Server types.
2. Configure `JdbcRegisteredClientRepository`,
   `JdbcOAuth2AuthorizationService`, and
   `JdbcOAuth2AuthorizationConsentService` against the shared datasource.
   Apply the official authorization-server schema via versioned Liquibase
   changesets.
3. Adapt `LoadUserForAuthenticationUseCase` to Spring Security
   `UserDetailsService`; adapt password hashing and current actor through the
   application output ports.
4. Provide a persistent RSA signing key/JWK source. A random key generated at
   each startup invalidates existing JWTs and breaks multi-instance
   deployments.
5. Implement OIDC ID-token claims from user profile data, honoring requested
   scopes. Spring Authorization Server's default UserInfo mapper returns the
   applicable ID-token claims; use a custom mapper only if the response needs
   different filtering. Add roles and effective permissions to access tokens
   only when the consuming API needs them.
6. Enable Dynamic Client Registration only with authenticated registration
   access tokens and bounded client settings. Do not expose unrestricted
   client creation.
7. Adapt OAuth login to `FindOrProvisionFederatedUserUseCase`. Store provider
   credentials as environment variables and configure each provider through
   Spring Security's standard OAuth2 client registration/provider properties.
8. Add protocol integration tests for discovery, authorization code + PKCE,
   refresh token rotation, OIDC UserInfo, JWT claims, and protected DCR.

## Official reference

Spring Authorization Server documents authorization grants, token formats,
client authentication, protocol endpoints, and OIDC in its
[feature overview](https://docs.spring.io/spring-authorization-server/reference/overview.html).
The implementation follows its guidance for [custom access-token claims](https://docs.spring.io/spring-authorization-server/reference/guides/how-to-custom-claims-authorities.html)
and [scope-aware ID-token/UserInfo claims](https://docs.spring.io/spring-authorization-server/reference/guides/how-to-userinfo.html),
and [Dynamic Client Registration](https://docs.spring.io/spring-authorization-server/reference/guides/how-to-dynamic-client-registration.html).
Federated login follows the official [social login guide](https://docs.spring.io/spring-authorization-server/reference/guides/how-to-social-login.html).
Use the matching version's [core model and configuration guide](https://docs.spring.io/spring-authorization-server/reference/core-model-components.html).

## Progress

- Implemented: JDBC client, authorization, and consent services use the shared
  datasource; local OIDC clients use authorization code + PKCE. Confidential
  clients can use refresh-token rotation.
- Implemented: a local `iam-postman` public client uses authorization code
  + PKCE with Postman's callback URL, allowing Postman to receive codes without
  a client secret.
- Implemented: password authentication loads users through the application
  use case; access tokens include the user's IAM authorities.
- Implemented: access tokens expose stable `sub`/`user_uuid`, `roles`, and
  `permissions` claims. OIDC ID tokens expose profile, email, phone, and address
  claims only when the corresponding scope was granted; Spring's default
  UserInfo response derives those standard claims from the ID token.
- Implemented: Google, GitHub, and Facebook OAuth logins provision/link IAM
  identities through `FindOrProvisionFederatedUserUseCase`; GitHub verified
  email is loaded from its `/user/emails` endpoint when the profile omits it.
- Implemented: Google, GitHub, Facebook, and Telegram client registrations are
  declared under `spring.security.oauth2.client` in `application.yaml`, with
  credentials supplied by environment variables. Telegram uses its official
  OpenID Connect endpoints and `openid profile` scopes. Telegram does not
  provide an email claim; IAM stores a reserved `users.invalid` placeholder
  marked unverified to satisfy the local account model. Register the exact
  callback URL used by the browser with Telegram through @BotFather's Login
  Widget settings. For local access it is
  `http://localhost:9000/login/oauth2/code/telegram`; for a public HTTPS tunnel,
  register that tunnel's `/login/oauth2/code/telegram` URL. Set
  `TELEGRAM_REDIRECT_URI` to the same full URL when proxy headers do not produce
  the registered callback automatically. See [Telegram Login](https://core.telegram.org/bots/telegram-login).
- Implemented: Spring Authorization Server's OIDC Client Registration endpoint
  is enabled with PKCE and consent required for dynamically registered clients.
  A confidential registrar client is seeded only when
  `IAM_DCR_CLIENT_SECRET` is configured, and its sole grant is
  `client_credentials` with the `client.create` scope.
- Verified: an integration test obtains the one-time registrar token, registers
  a confidential client, and retrieves its metadata using the returned
  `registration_access_token`. The validator preserves Spring's strict redirect
  URI/JWKS checks and accepts only `openid`, `profile`, `email`, `phone`, and
  `address` scopes.
- Fixed: access-token `sub` is the IAM user's UUID, matching `/api/me` and
  avoiding a username-to-UUID mismatch.
- Implemented: deployments can load PKCS#8 private and X.509 public RSA PEM
  files using `IAM_JWK_PRIVATE_KEY_PATH` and `IAM_JWK_PUBLIC_KEY_PATH`; the
  JWK identifier is derived from the public key. If both paths are omitted, a
  development key is generated at startup. Configure persistent key files in
  deployments so tokens remain verifiable across restarts.
- Verified: an end-to-end test creates an IAM user, signs in, completes an
  authorization-code + PKCE exchange, checks access and ID-token claims,
  calls UserInfo, rotates a refresh token, and confirms the old refresh token
  is rejected. Refresh-token behavior is tested with a confidential client.
- Verified: Telegram's registration is built from the standard YAML properties
  when credentials are present, and Telegram identity mapping is covered by
  infrastructure tests. Real provider callbacks still require valid provider
  credentials and an allowlisted redirect URI.
- Deployment setup remains: set `IAM_DCR_CLIENT_SECRET` to enable the dynamic
  registrar and configure persistent RSA PEM key paths using
  `IAM_JWK_PRIVATE_KEY_PATH` and `IAM_JWK_PUBLIC_KEY_PATH`.

### Get an access token in Postman

Restart IAM once so `iam-postman` is seeded into the registered-client table.
In Postman, open **Authorization → OAuth 2.0 → Get New Access Token** and use:

| Setting | Value |
| --- | --- |
| Grant Type | Authorization Code (With PKCE) |
| Callback URL | `https://oauth.pstmn.io/v1/callback` |
| Auth URL | `http://localhost:9000/oauth2/authorize` |
| Access Token URL | `http://localhost:9000/oauth2/token` |
| Client ID | `iam-postman` |
| Client Secret | leave blank |
| Code Challenge Method | `S256` |
| Scope | `openid profile` |

Click **Get New Access Token**, sign in with an IAM user, then click **Use
Token**. In Scalar, authorize API requests with `Bearer <access-token>`.
The seeded `iam-postman` client is public and uses PKCE. Its access token lasts
5 hours. When it expires, start **Get New Access Token** again and sign in; do
not configure a client secret for this public client. The authorization-code
flow redirects through a browser; posting a username/password JSON body to
`/login` does not issue a token.

### Token expiration and refresh

The seeded client token settings are:

| Token | Lifetime | Behavior |
| --- | --- | --- |
| Access token | 5 hours | Self-contained JWT; APIs reject it after `exp` |
| Authorization code | 3 minutes | One-time code used by the callback to get tokens |
| Refresh token | 7 days | Rotated on use (`reuseRefreshTokens=false`) for clients authorized to use this grant |

The shipped `iam-postman` and `oidc-client` entries are public clients and
advertise authorization code only. When their access token expires, run the
browser authorization flow again. A confidential application can use the
refresh-token grant: keep its client secret and refresh token on the backend,
submit `grant_type=refresh_token` with the current refresh token to
`POST /oauth2/token`, and replace the stored refresh token with the newly
returned one. Rotation invalidates the previous refresh token; retrying a
rotated token fails. If refresh returns `invalid_grant` (expired, revoked, or
already rotated), clear the stored tokens and start authorization again.

For local confidential-client work, register a client with
`client_secret_basic`, `authorization_code` and `refresh_token` grants,
`requireProofKey=true`, and `reuseRefreshTokens=false`. Use PKCE even for a
confidential client. The integration test demonstrates this flow; never put a
production client secret in a browser, mobile app, or Postman collection.

Example refresh request (run only from the confidential application's
backend):

```bash
curl --user "$OAUTH_CLIENT_ID:$OAUTH_CLIENT_SECRET" \
  --data-urlencode "grant_type=refresh_token" \
  --data-urlencode "refresh_token=$REFRESH_TOKEN" \
  http://localhost:9000/oauth2/token
```

Persist both returned tokens atomically. If the process crashes after the
server rotates the refresh token but before saving its replacement, the old
one cannot be used again; send the user through authorization again.

### Dynamic client registration

Set `IAM_DCR_CLIENT_SECRET` to a long random secret before starting IAM. Obtain
an initial token from `/oauth2/token` using Basic authentication for
`iam-client-registrar` and form data `grant_type=client_credentials&scope=client.create`.
Use that token once for `POST /connect/register`. Spring Authorization Server
returns a per-client `registration_access_token`; use it as a bearer token to
read `/connect/register?client_id=<client_id>`. Dynamically registered clients
must use PKCE and receive an authorization consent screen.
