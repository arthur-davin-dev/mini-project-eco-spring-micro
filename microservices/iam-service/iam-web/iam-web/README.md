# IAM React account app

This React/Vite app provides the sign-in, registration, consent, connected applications, and account experience served by the IAM web module. The Gradle `buildReactFrontend` task builds the app into `iam-web/src/main/resources/static`, where Spring serves the entry point and assets from the static root.

The account UI follows a feature based layout: shared pieces live in `src/components`, IAM account state in `src/contexts`, API calls in `src/features/profile/api`, and account screens in `src/features/profile/pages`. English and Khmer copy live in `src/i18n`.

## Local development

```sh
npm install
npm run dev
```

The Vite dev server proxies API and account-link requests to `http://localhost:8080` by default; set `VITE_IAM_ORIGIN` to use another backend. During development, provide an IAM access token in the app's connection form; it is kept in `sessionStorage` and cleared when signing out. In the hosted app, an authenticated IAM browser session loads the signed-in profile automatically.

The IAM Gradle build uses the Node Gradle plugin to provision Node.js and npm, install frontend dependencies, and build Vite assets as part of `:iam-web:processResources`.

## API coverage

- Profile read/update: `GET/PATCH /api/me`
- Password change: `PUT /api/me/password`
- Linked identity list/removal: `GET/DELETE /api/me/identities`
- Provider linking starts through the authenticated web route `/profile/accounts/link/{provider}`.

The current IAM REST API does not expose account photo upload, session inventory or termination, login history, account activity, or a deactivation request endpoint. The React screens identify those limits instead of showing sample account records.
