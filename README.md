<div align="center">
  <a href="https://youtu.be/v4Zihx55A-w">
    <img src="https://github.com/user-attachments/assets/f7cf8b29-0dab-41b8-980a-58a6551b8f99" alt="SecurCity demonstration" width="720" />
  </a>

  # SecurCity 2.0

  [![Version](https://img.shields.io/badge/version-2.0.0-0f766e?style=for-the-badge)](https://github.com/ADreLOI/IS-Project-SECURCITY)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![React Native](https://img.shields.io/badge/React_Native-Expo-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://expo.dev/)
  [![License](https://img.shields.io/badge/License-AGPL--3.0-0f766e?style=for-the-badge)](./LICENSE.txt)

  **A cross-platform civic-safety platform that combines safer-route planning, citizen reports, IoT-informed alerts, and municipal operations.**

  [Watch the video demo](https://youtu.be/v4Zihx55A-w)
</div>

> **Recognition.** SecurCity was selected as one of six finalist projects in UniTrento's *100 Progetti per il Comune di Trento* initiative, which involved around one hundred DISI students. The University of Trento's official recap describes SecurCity as an integrated platform for safer and more liveable cities. [Read the article](https://pressroom.unitn.it/comunicato-stampa/cento-progetti-trento-lapp-scudo-vince-la-nuova-sfida).

## Overview

SecurCity helps citizens make more informed urban journeys while giving municipal operators a practical way to understand and respond to safety signals. It was developed for the **Software Engineering** course at the University of Trento.

The system brings together:

- Safety-aware route generation based on maps and live contextual data.
- Anonymous citizen reports and emergency-contact workflows.
- A web workspace for municipal staff to manage reports, tokens, sensors, and alerts.
- A mobile experience for citizens, built for Android and iOS.
- A REST API that centralises application logic and data access.

## Architecture

```text
Web application (Expo / React) ─┐
                                 ├── Express REST API ── MongoDB
Mobile application (React Native)┘          │
                                      Maps, OAuth, email and IoT data
```

## Technology

| Area | Technology |
| --- | --- |
| Mobile client | React Native, Expo, TypeScript, NativeWind |
| Web client | React, Expo Web, TypeScript |
| Backend | Node.js, Express, Mongoose, JWT |
| Integrations | Google Maps, Google Sign-In, SendGrid |
| Testing | Jest, Supertest |

## Run locally

### Prerequisites

- Node.js 20 LTS or later
- npm
- A MongoDB instance
- Credentials for the enabled map, OAuth and email integrations

### 1. Configure the API

```bash
cd BackEnd
cp .env.example .env
# Set the placeholders in .env; do not commit this file.
npm ci
npm test
npm run dev
```

### 2. Start the web client

```bash
cd FrontEnd/WebApp
npm ci
npm run web
```

### 3. Start the mobile client

```bash
cd FrontEnd/MobileApp
npm ci
npm start
```

> [!IMPORTANT]
> No production credentials are included in this repository. Create local configuration from the example file and use your own integration keys. This keeps the project safe to share publicly.

## Repository layout

```text
BackEnd/              Express API, data models, routes and API tests
FrontEnd/WebApp/      Operations-oriented web application
FrontEnd/MobileApp/   Citizen-facing React Native application
```

Each component contains implementation-level documentation. The backend API contract is available in [`BackEnd/swagger.yaml`](./BackEnd/swagger.yaml).

## Team

- [Andrea Lo Iacono](https://github.com/ADreLOI)
- [Matthew De Marco](https://github.com/MattDema)
- [Andrea Pezzo](https://github.com/AndreaP2203)

## Academic context

**Software Engineering** - University of Trento<br>
Faculty: Sandro Fiore, Chiara Di Francescomarino and Marco Robol

## License

The source code is distributed under the [GNU Affero General Public License v3.0](./LICENSE.txt). The SecurCity name, logo and related branding remain the property of the project authors.
