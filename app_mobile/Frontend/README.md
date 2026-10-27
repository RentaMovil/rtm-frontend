# RentaMovil Mobile

RentaMovil's customer mobile application, built with Expo, React Native, and TypeScript. It consumes
the system APIs through `rtm-api-gateway`; it does not contain microservices or own backend data.

---

## Responsibility

Provide RentaMovil customers with the mobile features available on Android and iOS, including sign
in, vehicle browsing, reservation creation and history, payments, and profile management.

---

## Location in the architecture

| Field             | Value                                                                        |
| ----------------- | ---------------------------------------------------------------------------- |
| Type              | Customer mobile application                                                  |
| Path              | `RentaMovil/app_mobile/Frontend`                                             |
| Stack             | Expo SDK 54 · React Native 0.81 · TypeScript · Expo Router                   |
| Local development | Metro on port 8081                                                           |
| API               | `rtm-api-gateway` on port 8080 (local)                                       |
| Database          | None; data belongs to backend services                                       |
| Communicates with | `rtm-api-gateway`, which routes requests to IAM, Fleet, Booking, and Payment |

---

## Responsibilities

- Provide mobile authentication, catalog, reservation, payment, profile, and notification flows.
- Map API responses to the models used by the interface.
- Manage the customer session: the access token stays in memory, while the refresh token uses
  SecureStore, with an AsyncStorage fallback when SecureStore is unavailable.
- Send requests through the gateway and cancel data loads tied to screen lifecycles.

## Out of scope

- Business rules, final authorization, persistence, and microservice contracts belong to the backend.
- Administrative operations are handled by the web frontend.

---

## Structure

```text
src/
├── app/                 Expo Router routes and layouts
├── features/            auth, vehicles, reservations, payment, and other feature modules
├── shared/              HTTP API, components, hooks, and push-token registration
├── config/              Base URL and typed gateway routes
├── theme/               Shared typography, colors, and styles
├── types/               Application models and types
└── translation/         Languages and i18next configuration
assets/                  App icons and images
app.json                 Expo configuration
eas.json                 EAS build and distribution profiles
```

---

## Requirements

- Node.js 22 or later and npm.
- To use local services, `rtm-api-gateway` and the microservices required by the current flow must
  be running.
- EAS builds require an Expo account with access to the EAS project configured in `app.json`.

## Run locally

From this directory:

```bash
# Install dependencies
npm ci

# Create local configuration (once)
cp .env.example .env

# Start Metro
npm start
```

Use `npm run android`, `npm run ios`, or `npm run web` to start Expo on the desired platform. With a
development build installed, start the bundler with `npx expo start --dev-client`.

### Configure the gateway

`EXPO_PUBLIC_API_URL` sets the API base URL. It is blank in `.env.example`, so the app uses the
defaults in `src/config/env.ts`:

| Local environment    | Default URL                                                        |
| -------------------- | ------------------------------------------------------------------ |
| iOS Simulator or web | `http://localhost:8080`                                            |
| Android emulator     | `http://10.0.2.2:8080`                                             |
| Physical device      | Set your computer's LAN IP, for example `http://192.168.1.50:8080` |

The phone and computer must be on the same network, the gateway must accept connections through the
LAN interface, and the firewall must allow port 8080. To use another environment, set the URL in
`.env` and restart Metro so Expo reloads the variables.

EAS profiles set `EXPO_PUBLIC_API_URL` at build time and point to the deployed gateway
(`https://rentamovil.tech/api`). The URL is bundled into the binary. To use a local gateway with an
EAS development build, set a LAN-accessible URL in that profile and build it again.

`EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` and `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` configure image and
payment-receipt uploads. The app has default values documented in `.env.example`.

---

## Checks

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
```

The mobile GitHub Actions job runs lint and formatting as informational checks while existing debt
is reviewed. Type checking and tests block the job on failure.

---

## EAS profiles

Profiles are defined in `eas.json` and configure the deployed gateway URL:

| Profile       | Android distribution                                       | Use                              |
| ------------- | ---------------------------------------------------------- | -------------------------------- |
| `development` | Internal APK with a development client                     | Development and Metro connection |
| `preview`     | Internal APK                                               | Review distribution              |
| `production`  | Android App Bundle (AAB), with automatic version increment | Release                          |

Android build commands:

```bash
npx eas-cli build --platform android --profile development
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform android --profile production
```

---

## Related documents

- [Mobile architecture](../../../rtm-docs/05-architecture/mobile-architecture.md) — application
  structure and conventions.
- [Frontend architecture](./Arquitectura.md) — detailed source-code structure.
- [API Gateway](../../../rtm-api-gateway/README.md) — system HTTP entry point.
- [Web frontend](../../web/Front-end/README.md) — RentaMovil's web client.
- [Git conventions](../../../rtm-docs/00-governance/git-conventions.md) — branches and pull requests.
