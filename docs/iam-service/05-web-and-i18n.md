# Step 5: JTE web pages and localization

## Implementation

- `iam-web` uses the JTE Spring Boot 4 starter and the matching JTE Gradle
  plugin. Templates live in `iam-web/src/main/jte`, are precompiled during the
  build, and are packaged into the web module's classpath output.
- English and Khmer message bundles are `messages.properties` and
  `messages_km.properties`. `?lang=en` and `?lang=km` switch the session locale.
- CSRF tokens are included in every state-changing form. Password inputs are
  never returned to views after validation failures.
- Registration and sign-in are public. Profile pages require an authenticated
  IAM user and call application use cases for profile, password, and identity
  changes.

## Routes

| Route | View | Behavior |
| --- | --- | --- |
| `GET /login` | `login.jte` | Password sign-in, configured social providers, language switch, and distinct password/OAuth errors |
| `GET, POST /register` | `register.jte` | Self-registration through `RegisterUserUseCase` |
| `GET /oauth2/consent` | `consent.jte` | Shows the client and requested scopes; submits allow/cancel to the authorization endpoint |
| `GET /` | `index.jte` | Profile, roles, effective permissions, and navigation |
| `GET, POST /profile/edit` | `profile-edit.jte` | Edit profile and postal address |
| `GET, POST /profile/password` | `change-password.jte` | Change the current user's password |
| `GET /profile/accounts` | `linked-accounts.jte` | List, link, and unlink Google, GitHub, Facebook, and Telegram identities |
| `GET /profile/apps` | `connected-apps.jte` | List persisted OAuth consents and revoke them |

Social account linking records an explicit link intent in the authenticated
session, then runs the provider callback through `LinkIdentityUseCase` for that
same IAM user. It does not silently switch the session to a different account.

## Build and run

The JTE Gradle plugin precompiles templates with HTML escaping and includes the
generated classes in the `iam-web` output. This follows the official
[JTE Spring Boot 4 starter](https://jte.gg/spring-boot-starter-4/) and
[JTE Gradle plugin](https://jte.gg/gradle-plugin/) setup.

```bash
./gradlew -p microservices/iam-service :iam-web:precompileJte :iam-main:compileJava
```
