# 📱 SecurCity — Mobile App

> A citizen-facing mobile app built with React Native and Expo. Enables safe route navigation, reporting, and emergency assistance.

---

- [� SecurCity — Mobile App](#-securcity--mobile-app)
  - [📦 Overview](#-overview)
  - [⚙️ Setup](#️-setup)
  - [🔐 Google Sign-In Setup](#-google-sign-in-setup)
  - [🚀 EAS Build Steps](#-eas-build-steps)
  - [🛠️ Troubleshooting](#️-troubleshooting)

---

## 📦 Overview

This folder contains the **React Native mobile app** for SecurCity citizens. It allows users to:

- Log in via email or Google
- Generate and follow safe itineraries
- Send reports anonymously
- Access emergency contacts quickly

Built with:

- **React Native** + **Expo SDK**
- **Tailwind CSS (NativeWind)**
- Integrated with SecurCity backend and Google APIs

---

## ⚙️ Setup

1. Move into the project directory:

   ```bash
   cd FrontEnd/MobileApp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file:

   ```env
   USE_PRODUCTION=false
   API_BASE_URL=your_url
   IOS_CLIENT_ID=your_google_ios_id
   WEB_CLIENT_ID=your_web_client_id
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

4. Install dev tools:

   ```bash
   npx expo install expo-dev-client
   npm install -g eas-cli
   eas login
   ```

---

## 🔐 Google Sign-In Setup

Follow these steps to configure Google Sign-In:

1. Go to [Google Console](https://console.cloud.google.com/)

2. Create a new project named **SecurCity**

3. Create two OAuth clients:

   - **Web**
   - **iOS** (if using simulator): set `bundleIdentifier` from `app.json`

4. Update `app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.YourUsername.securcity",
      "config": {
        "googleMapsApiKey": "YOUR_API_KEY"
      }
    },
    "android": {
      "package": "com.YourUsername.securcity"
    },
    "owner": "YourUsername"
  }
}
```

5. Set `iosUrlScheme` in `app.json`:

```json
{
  "@react-native-google-signin/google-signin": {
    "iosUrlScheme": "YourScheme"
  }
}
```

6. Add your client IDs to:

```ts
// app/constants.ts
export const webClientId = "YourWebClientID";
export const iosClientId = "YouriOSClientID";
```

---

## 🚀 EAS Build Steps

1. Build the dev client:

   ```bash
   eas build --platform android --profile development
   ```

2. Start the app:

   ```bash
   npx expo start
   ```

You can run it using:

- Android Studio emulator
- iOS simulator
- Expo Go (limited)

---

## 🛠️ Troubleshooting

If the app fails to load or hangs:

```bash
npx expo start --clear
```

If EAS throws project ownership errors:

```bash
eas init
```

This regenerates `eas.json` and fixes project links.

---

⬆ [Back to top](#-securcity--mobile-app)

