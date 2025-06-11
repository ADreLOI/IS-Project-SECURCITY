# 📍 SecurCity 2.0

<img src="https://github.com/user-attachments/assets/633617ac-49d8-4f66-b35c-9df7075c2439" alt="SecurCity Icon" width="50" align="right" />

<p align="center">
  <img src="https://github.com/user-attachments/assets/f7cf8b29-0dab-41b8-980a-58a6551b8f99" alt="SecurCity Logo" width="300"/>
</p>

> A cross-platform safety companion for smarter and safer urban navigation.

---

- [📍 SecurCity 2.0](#-securcity-20)
  - [🔎 What is SecurCity?](#-what-is-securcity)
  - [🎥 Demo Video](#-demo-video)
  - [⚙️ Key Features](#️-key-features)
  - [🧠 Architecture Overview](#-architecture-overview)
  - [📁 Project Structure](#-project-structure)
  - [🚀 Getting Started](#-getting-started)
    - [🌐 Web App](#-web-app)
    - [📱 Mobile App](#-mobile-app)
    - [🔧 Backend API](#-backend-api)
  - [� License](#-license)
  - [🙏 Acknowledgments](#-acknowledgments)
  - [🧑‍💻 Team Members](#-team-members)
  - [🍿️ Tags](#️-tags)

---


## 🔎 What is SecurCity?

**SecurCity** is a cross-platform system designed to enhance personal safety in everyday life. By leveraging intelligent route planning, real-time alerts, and the collaboration of public institutions, it helps users reach destinations safely and confidently.

> [!NOTE]\
> The system includes a RESTful API, a web interface, and a mobile app that work together to support citizens and municipal operators.

---

## 🎥 Demo Video

> 👉 [**Watch the demo on YouTube**](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

---

## ⚙️ Key Features

- 🚣️ **Safe route generation** via Google Maps and real-time data
- 🧑‍💻 **User authentication** (email + Google Sign-In)
- 📢 **Anonymous crime reports** and emergency contact system
- 🏫 **Municipal dashboard** for managing tokens, sensors, and alerts
- 📦 Modular frontend/backend architecture

---

## 🧠 Architecture Overview

```
WebApp (React + Expo)    MobileApp (React Native + Expo)
           \                   /
            \                 /
             -- REST API --> BackEnd (Express + Mongoose)
```

All clients communicate with the same API server for route generation, user actions, and map data.

> [!TIP]\
> Read how we generate safe paths in [BackEnd/README.md](./BackEnd/README.md).

---

## 📁 Project Structure

```bash
/FrontEnd
  ├── WebApp      # React-based web interface for operators
  └── MobileApp   # React Native app for citizens

/BackEnd          # Node.js REST API server

/assets           # Static files including logos and images
/LICENSE          # License information
/README.md        # You are here
```

Each subproject contains its own `README.md` with specific setup instructions.

---

## 🚀 Getting Started

### 🌐 Web App

```bash
cd FrontEnd/WebApp
npm install
npx expo start -w
```

➡ [WebApp/README.md](./FrontEnd/WebApp/README.md) for details

### 📱 Mobile App

```bash
cd FrontEnd/MobileApp
npm install
npx expo start
```

➡ [MobileApp/README.md](./FrontEnd/MobileApp/README.md) for details

### 🔧 Backend API

```bash
cd BackEnd
npm install
npm run dev
```

➡ [BackEnd/README.md](./BackEnd/README.md) for full documentation

---

## 🔐 License

This project is licensed under the [AGPL-3.0 License](./LICENSE).

> [!WARNING]\
> The name "SecurCity", its logo, and all related branding are not covered by the AGPL license and remain © 2025 Matthew De Marco, Andrea Lo Iacono & Andrea Pezzo. All rights reserved.

---

## 🙏 Acknowledgments

Thanks to all professors and collaborators at **Università di Trento** for their guidance and support throughout the development of this project.

Special thanks to:

- Prof. Marco Robol (Software Engineering)

---

## 🧑‍💻 Team Members

- [Andrea Lo Iacono](https://github.com/ADreLOI)\
  📧 [andrea.loiacono@studenti.unitn.it](mailto\:andrea.loiacono@studenti.unitn.it)
- [Matthew De Marco](https://github.com/MattDema)\
  📧 [matthew.demarco@studenti.unitn.it](mailto\:matthew.demarco@studenti.unitn.it)
- [Andrea Pezzo](https://github.com/AndreaP2203)\
  📧 [andrea.pezzo-1@studenti.unitn.it](mailto\:andrea.pezzo-1@studenti.unitn.it)

---

## 🍿️ Tags

&#x20;  &#x20;

---

⬆ [Back to top](#-securcity-20)