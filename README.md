# SecurCity 1.0

SecurCity is a cross-platform system designed to enhance personal safety in everyday life. By leveraging intelligent route planning, it helps users reach their destinations safely with the support of local public services, municipal authorities, and real-time community alerts submitted anonymously. 

## Project structure

The project is divided in two main parts: FrontEnd and BackEnd.

## Get started with web app

The web app is developed using [React]([https://reactnative.dev/docs/getting-started](https://react.dev/learn)) and [Expo](https://docs.expo.dev/get-started/introduction/) frameworks.

1. Move into ```WebApp``` directory

```bash
   cd FrontEnd/WebApp
   ```

2. Install dependencies

```bash
   npm install
   ```

3. Start the app in your simulator

```bash
   npx expo start -w
   ```

Also, to enable Google Signin:
- Go to your [Google Console](https://console.cloud.google.com/) and create a new project and called it **SecurCity**
- Go to **API & Services** and create a new **OAuth Client**
- Select application type **Web** and give it a name

## 📁 File Organization

### 🔧 Root Files

- `.gitignore` – Specifica i file da escludere dal controllo di versione.
- `app.config.js` – Configurazione generale dell'app.
- `babel.config.js` – Configurazione di Babel.
- `config.js` – Configurazioni personalizzate.
- `eslint.config.js` – Regole per l'analisi statica del codice (linting).
- `metro.config.js` – Configurazione per Metro bundler.
- `nativewind-env.d.ts` – Tipizzazioni per NativeWind.
- `package.json` / `package-lock.json` – Gestione delle dipendenze e script.
- `tailwind.config.js` – Configurazione di Tailwind CSS.
- `tsconfig.json` – Configurazione del compilatore TypeScript.
- `webpack.config.js` – Configurazione di Webpack.

---

### 📂 Animations

Contiene hook personalizzati per animazioni, come la rotazione infinita con Reanimated.

### 📂 App

Struttura principale dell’applicazione:

- `+not-found.tsx` – Pagina per errori 404.
- `global.css` – Stili globali.
- `index.tsx` – Entry point dell'applicazione.
- `pages/` – Pagine principali della webapp.
- `Operatore/` – Dashboard e gestione token per l'operatore.
- `RecoverPasswordCittadino/` – Recupero password per utenti cittadini.

### 📂 Assets

File statici: immagini, SVG, loghi, ecc.

### 📂 Components

Componenti UI riutilizzabili: bottoni, form, layout, ecc.

### 📂 Constants

Costanti globali usate nell’applicazione.

### 📂 Hooks

Hook React personalizzati per funzionalità condivise.

### 📂 Scripts

Script di supporto per automazioni e task ricorrenti.


## Get started with mobile app

The mobile app is developed using [React Native](https://reactnative.dev/docs/getting-started) and [Expo](https://docs.expo.dev/get-started/introduction/) frameworks.

1. Move into ```MobileApp``` directory

```bash
   cd FrontEnd/MobileApp
   ```

2. Install dependencies

```bash
   npm install
   ```

3. Create your own development build in the **simulator** (iOS or Android)

```bash
   npx expo install expo-dev-client
   ```

4. Create an Expo account and install EAS cCLI

```bash
   npm install -g eas-cli
   ```

5. In the terminal log in your account using

```bash
   eas login
   ```

6. Start your development build using the choosen simulator

```bash
   eas build --platform ios --profile development
   ```

7. Start the app in your simulator

```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Important

Before you start your app, make sure to have changed in ```app.json``` the owner field, otherwise EAS will give you an error saying that you are not the project owner
```json
{
  "name": "SecurCity",
  "slug": "SecurCity",
  "scheme": "com.YourUsername.securcity",
  "version": "1.0.0",
  "owner": "YourUsername",
  "orientation": "portrait"
}
```

Also, to enable Google Signin:
- Go to your [Google Console](https://console.cloud.google.com/) and create a new project and called it **SecurCity**
- Go to **API & Services** and create a new **OAuth Client**
- Select application type **Web** and give it a nane

Repeat the process but if you choose to use a iOS simulator do:
- Select application type **iOS** and give it a name
- Then write in "ID bundle" the bundle that you wrote on ```app.json``` for ```bundleIdentifier```
```json
{
   "ios": 
   {
      "supportsTablet": true,
      "bundleIdentifier": "com.YourUsername.securcity",
      "config": {
        "googleMapsApiKey": "AIzaSyA_HYPztvPp_5YmMFUzc1DiV7RsmE0qYB0"
      },
    }
}
```
- After creating the OAuth Client, copy the **Schema URL iOS** and paste it on ```app.json``` for
```json
{
 "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "YourScheme"
        }
}
 ```

After this steps import your **Web Client ID** and **iOS Client ID** in your project, by doing:
- Create in "app" folder a file called ```costants.ts```
- Inside the file paste this block of code changing the variables with your IDs
```ts
export const webClientId = "YourWebClientID";
export const iosClientId = "YouriOSClientID";
```
Now you can log into the app using your Google account!

## Errors troubleshooting

### Sometimes if the app doesn't load in the development build using ```npx expo start``` and show something like "Welcome to Expo, to start..." just do the following command

```bash
   npx expo start --clear
   ```

In this way you clear the build and the app loads correctly

### Another common error can be the terminal showing something like "The project Id doesn't match your account" then try rebuilding the app but before that use

```bash
   eas init
   ```

This command regenerates the ```eas.json``` and updates the ```app.json``` with your correct **project ID** (remember to be logged in EAS)
