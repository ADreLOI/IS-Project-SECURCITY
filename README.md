<a id="top"></a>

# SecurCity 2.0

<p align="center">
  <a href="https://github.com/ADreLOI/IS-Project-SECURCITY/releases">
    <img src="https://img.shields.io/badge/version-2.0.0-2563EB?style=flat-square" alt="Version 2.0.0" />
  </a>
  <img src="https://img.shields.io/badge/course-Software%20Engineering-0F766E?style=flat-square" alt="Software Engineering course" />
  <img src="https://img.shields.io/badge/platform-Web%20%7C%20iOS%20%7C%20Android-7C3AED?style=flat-square" alt="Cross-platform" />
  <a href="./LICENSE.txt">
    <img src="https://img.shields.io/badge/license-AGPL--3.0-111827?style=flat-square" alt="AGPL-3.0 license" />
  </a>
</p>

<p align="center">
  <a href="https://youtu.be/v4Zihx55A-w">
    <img src="https://github.com/user-attachments/assets/f7cf8b29-0dab-41b8-980a-58a6551b8f99" alt="SecurCity video demo" />
  </a>
</p>

<p align="center"><strong>Click the image to watch the video demo.</strong></p>

> A cross-platform safety companion for smarter, safer urban navigation. Built as Group 10's Software Engineering project at the University of Trento.

> **Recognition.** SecurCity was one of the six finalist projects in the University of Trento's *100 Progetti per Trento* challenge. [Read the University article](https://pressroom.unitn.it/comunicato-stampa/cento-progetti-trento-lapp-scudo-vince-la-nuova-sfida).

## Table of contents

- [Overview](#overview)
- [Demo](#demo)
- [Key features](#key-features)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Recognition](#recognition)
- [Course and supervision](#course-and-supervision)
- [Team](#team)
- [License](#license)
- [Repository topics](#repository-topics)

## Overview

**SecurCity** helps citizens reach destinations safely and confidently through intelligent route planning, real-time alerts, and collaboration with municipal operators.

The system combines a REST API, an operator-facing web interface, and a citizen-facing mobile app.

<p align="right"><a href="#top">Back to top</a></p>

## Demo

Watch the complete [SecurCity video demo on YouTube](https://youtu.be/v4Zihx55A-w).

<p align="right"><a href="#top">Back to top</a></p>

## Key features

- Safe route generation via Google Maps and real-time data
- Email and Google Sign-In authentication
- Anonymous crime reports and emergency-contact support
- Municipal dashboard for tokens, sensors, alerts, and report management
- Modular web, mobile, and backend architecture

<p align="right"><a href="#top">Back to top</a></p>

## Architecture

```text
Web app (React + Expo)          Mobile app (React Native + Expo)
             \                         /
              \                       /
               -------- REST API -------
                         Express + Mongoose
```

Both clients communicate with the same API for route generation, user actions, and map data. The safe-routing logic is documented in [BackEnd/README.md](./BackEnd/README.md).

<p align="right"><a href="#top">Back to top</a></p>

## Project structure

```text
FrontEnd/
  WebApp/          # React-based interface for municipal operators
  MobileApp/        # React Native app for citizens
BackEnd/            # Node.js REST API server
assets/             # Logos and static assets
LICENSE.txt         # AGPL-3.0 license
README.md           # Project overview
```

Each component has its own README with implementation-specific notes.

<p align="right"><a href="#top">Back to top</a></p>

## Getting started

### Prerequisites

- Node.js and npm
- An instance of MongoDB for the backend
- Google OAuth, Maps, and SendGrid credentials where the corresponding features are enabled

### Configure the backend

```bash
cd BackEnd
cp .env.example .env
```

Fill in your own values in `.env`. Never commit credentials or a real administrator code.

### Web app

```bash
cd FrontEnd/WebApp
npm install
npx expo start -w
```

See [FrontEnd/WebApp/README.md](./FrontEnd/WebApp/README.md) for details. The historical course deployment is available at [is-project-securcity.onrender.com](https://is-project-securcity.onrender.com).

### Mobile app

```bash
cd FrontEnd/MobileApp
npm install
npx expo start
```

See [FrontEnd/MobileApp/README.md](./FrontEnd/MobileApp/README.md) for device and emulator notes.

### Backend API

```bash
cd BackEnd
npm install
npm run dev
```

See [BackEnd/README.md](./BackEnd/README.md) for endpoints and safe-routing details.

<p align="right"><a href="#top">Back to top</a></p>

## Recognition

SecurCity was selected among the six finalist groups from approximately one hundred DISI students involved in the 2026 *100 Progetti per Trento* challenge, presented in the context of Software Engineering courses. [University of Trento press release](https://pressroom.unitn.it/comunicato-stampa/cento-progetti-trento-lapp-scudo-vince-la-nuova-sfida).

<p align="right"><a href="#top">Back to top</a></p>

## Course and supervision

**Software Engineering - University of Trento**

- [Assoc. Prof. Sandro Luigi Fiore](https://webapps.unitn.it/du/it/Persona/PER0228723/Didattica)
- [Asst. Prof. Chiara Di Francescomarino](https://webapps.unitn.it/du/it/Persona/PER0025609/Didattica)
- [Asst. Prof. Marco Robol](https://webapps.unitn.it/du/it/Persona/PER0049999/Didattica)

<p align="right"><a href="#top">Back to top</a></p>

## Team

**Group 10**

| Member | GitHub | LinkedIn | Email |
| --- | --- | --- | --- |
| Andrea Lo Iacono | [ADreLOI](https://github.com/ADreLOI) | [andreloi](https://www.linkedin.com/in/adreloi) | [andrea.loiacono@studenti.unitn.it](mailto:andrea.loiacono@studenti.unitn.it) |
| Matthew De Marco | [MattDema](https://github.com/MattDema) | Profile link pending confirmation | [matthew.demarco@studenti.unitn.it](mailto:matthew.demarco@studenti.unitn.it) |
| Andrea Pezzo | [AndreaP2203](https://github.com/AndreaP2203) | [andrea-pezzo-34525b191](https://www.linkedin.com/in/andrea-pezzo-34525b191) | [andrea.pezzo-1@studenti.unitn.it](mailto:andrea.pezzo-1@studenti.unitn.it) |

<p align="right"><a href="#top">Back to top</a></p>

## License

This project is licensed under the [AGPL-3.0 License](./LICENSE.txt).

The name **SecurCity**, its logo, and related branding are not covered by the AGPL license and remain Copyright 2025 Matthew De Marco, Andrea Lo Iacono, and Andrea Pezzo.

<p align="right"><a href="#top">Back to top</a></p>

## Repository topics

`software-engineering` `smart-city` `public-safety` `react-native` `expo` `nodejs` `express` `mongodb` `google-maps` `university-of-trento`

<p align="right"><a href="#top">Back to top</a></p>

