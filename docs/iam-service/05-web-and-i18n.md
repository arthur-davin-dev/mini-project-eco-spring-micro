# Step 5: React web application and localization

## Implementation

The `iam-web` module builds the React/Vite application in `iam-web/iam-web` and packages the entry point and assets directly in `static/`. Spring MVC controllers forward browser pages to the React entry point. The application includes account settings, sign-in, registration, OAuth consent, and connected applications. Form posts continue to use the existing Spring Security endpoints and CSRF protection.

English and Khmer account messages are stored in the React app's `src/i18n` files. The backend message bundles remain available for server-side validation and API messages. The account session endpoint supplies the current user and linked identities to React.

## Routes

| Route | Behavior |
| --- | --- |
| `GET /login` | React sign-in page with password and social provider links |
| `GET, POST /register` | React registration form; POST delegates to `RegisterUserUseCase` |
| `GET /oauth2/consent` | React consent screen submits allow/cancel to the authorization endpoint |
| `GET /account` | React account experience |
| `GET /account/session` | Current authenticated user and linked identities |
| `GET /profile/apps` | React connected applications page |
| `GET /profile/apps/data` | Persisted OAuth consents for the current user |
| `POST /profile/apps/{registeredClientId}/revoke` | Revoke a connected application consent |

Social account linking records an explicit link intent in the authenticated session, then runs the provider callback through `LinkIdentityUseCase` for that same IAM user. It does not silently switch the session to a different account.

## Build

```bash
./gradlew -p microservices/iam-service :iam-web:buildReactFrontend :iam-web:compileJava
```
