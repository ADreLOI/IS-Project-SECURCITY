# 🛠️ SecurCity — Backend API

> Node.js REST API server powering safe route generation, user management, and smart city integration.

---

<details>
<summary>📑 Table of Contents</summary>

- [�️ SecurCity — Backend API](#️-securcity--backend-api)
  - [📦 Overview](#-overview)
  - [⚙️ Setup](#️-setup)
  - [🔐 Environment Variables](#-environment-variables)
  - [🧪 Running Tests](#-running-tests)
  - [🗺️ Main Endpoints](#️-main-endpoints)
  - [🧠 Safe Route Logic](#-safe-route-logic)
  - [📂 Folder Structure](#-folder-structure)

</details>

---

## 📦 Overview

This folder contains the **Node.js + Express** backend of the SecurCity platform. It exposes a RESTful API that:

- Authenticates users via email/password or Google
- Handles emergency reports and contacts
- Manages tokens for municipal operators
- Generates safe itineraries based on geodata and context

The backend integrates with:
- **MongoDB** (via Mongoose)
- **Google Maps & Places API**

---

## ⚙️ Setup

1. Clone the project and move into the folder:
   ```bash
   cd BackEnd
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   > [!NOTE] The default port is `3000`, but you can override it with an env variable.

---

## 🔐 Environment Variables

Create a `.env` file with at least the following values:

```env
MONGODB_URI=mongodb://localhost:27017/securcity
JWT_SECRET=your_jwt_secret_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
SENDGRID_API_KEY=your_sendgrid_api_key
BASE_CONFIRMATION_URL=your_base_url/api/v1/cittadino/confirm
SECRET_ADMIN_CODE=your_secret_admin_code
```

Optional:
```env
PORT=3000
```

---

## 🧪 Running Tests

This project uses **Jest** for testing.
To run the tests:
```bash
npm test
```

---

## 🗺️ Main Endpoints

All endpoints are prefixed with `/api/v1/`:

| Path                  | Description                                 |
|-----------------------|---------------------------------------------|
| `/cittadino`          | Citizen actions: auth, reports, contacts    |
| `/comune`             | Token generation for municipalities         |
| `/operatoreComunale` | Operator: review reports, sensors, routing  |
| `/itinerario`         | Safe route generation                       |
| `/maps`               | Google autocomplete and place details       |

> [!TIP]\
> Swagger documentation available soon in `swagger.yaml`

---

## 🧠 Safe Route Logic

The core function `generaPercorsoSicuro` (in `controllers/itinerarioController.js`) builds safe routes based on these inputs:

1. **Base Route**: Uses Google Directions API to fetch the walking path.
2. **Contextual Data**:
   - Crime reports from DB
   - Sensors with crowding index
   - Nearby open shops from Google Places
3. **Scoring & Filtering**:
   - Each step is scored (e.g., +1 for shops, +2 for crowded areas, -2 for crimes)
   - Stops are selected if score > 0
   - Too-close or low-impact steps are removed
4. **Fallback**:
   - If no valid alternatives exist, the original fast route is returned with a notice.

> [!NOTE]\
> Final safety grade (High, Medium, Low) is computed and stored with the itinerary.

---

## 📂 Folder Structure

```bash
BackEnd/
├── controllers/        # Business logic
├── models/             # Mongoose schemas
├── routes/             # Express routers
├── utils/              # Helper functions (e.g., email, scoring)
├── middleware/         # Auth, error handling
├── .env.example        # Sample environment variables
├── app.js              # App entry point
└── server.js           # Server bootstrap
```

---

⬆ [Back to top](#-securcity--backend-api)

