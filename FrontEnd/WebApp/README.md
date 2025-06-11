# 🌐 SecurCity — Web App (Operator Dashboard)

> React + Expo-based interface for municipal operators to manage tokens, reports, and monitor safe routes.

---

- [🌐 SecurCity — Web App (Operator Dashboard)](#-securcity--web-app-operator-dashboard)
  - [🖥️ Overview](#️-overview)
  - [⚙️ Setup](#️-setup)
  - [🔐 Google Sign-In Setup](#-google-sign-in-setup)
  - [📂 File Organization](#-file-organization)
  - [🌍 Environment Variables](#-environment-variables)

---

## 🖥️ Overview

This folder contains the **React-based web interface** used by municipal operators. It allows for:

- Reviewing and confirming citizen reports
- Managing tokens for operator registration
- Monitoring sensors and safe route generation

Built with **React**, **Expo**, and styled with **Tailwind CSS**.

---

## ⚙️ Setup

1. Move into the WebApp folder:

   ```bash
   cd FrontEnd/WebApp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the app in web mode:

   ```bash
   npx expo start -w
   ```

> [!NOTE] You can open the interface in the browser or test it inside Expo Go with limited support.

---

## 🌍 Live Deployment

➡ [**https://is-project-securcity.onrender.com**](https://is-project-securcity.onrender.com)

This is the deployed version of the WebApp. It is hosted via **Render** and automatically updated.

### 🔐 Admin Token Generation

To allow new Municipal Operators to sign up, a valid admin code is required.

- `SECRET_ADMIN_CODE`: `TrentoAdmin2025`

> ⚠️ This value is visible here only for testing. In a production environment, keep it secret in environment variables or secure vaults.

---

## 🔐 Google Sign-In Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **SecurCity**.
3. In "API & Services" > "OAuth Consent Screen" configure your app name.
4. Create OAuth credentials:
   - Application type: **Web**
   - Set authorized redirect URIs (e.g., `http://localhost:19006/`)
5. Save the **Web Client ID** and insert it in `constants.ts`:

```ts
// app/constants.ts
export const webClientId = "YOUR_WEB_CLIENT_ID";
```

> [!WARNING] If you do not configure the OAuth screen and redirect URIs properly, sign-in may fail silently.

---

## 📂 File Organization

```bash
WebApp/
├── app/
│   ├── +not-found.tsx            # 404 fallback page
│   ├── global.css                # Global styles
│   ├── index.tsx                 # App entry point
│   ├── pages/                    # Routing pages
│   ├── Operatore/               # Operator dashboard logic
│   └── RecoverPasswordCittadino/ # Password recovery
│
├── assets/                      # Images and logos
├── components/                  # Reusable UI components
├── constants/                   # Global constants
├── hooks/                       # Shared React hooks
├── scripts/                     # Helper scripts
├── tailwind.config.js          # Tailwind CSS config
├── app.config.js / config.js   # Expo + custom config
└── tsconfig.json               # TypeScript configuration
```

---

## 🌍 Environment Variables

Optional `.env` setup for custom API endpoint:

```env
API_BASE_URL=http://localhost:3000
```

If not provided, defaults defined in `config.js` will be used.

---

⬆ [Back to top](#-securcity--web-app-operator-dashboard)

