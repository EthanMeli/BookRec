# BookRec — Local Setup Guide (MERN + Expo)

A simple, step-by-step README to get the BookRec app running on your machine.  
You’ll spin up:

- a Node/Express API with MongoDB + JWT auth
- an Expo (React Native) mobile client

---

## Tech Stack

**Backend:** Node.js, Express, Mongoose, JWT, Cloudinary, bcryptjs, CORS, cron  
**Mobile:** Expo (React Native), expo-router, Zustand, AsyncStorage, expo-image, expo-image-picker

---

## Monorepo Layout

```
.
├── backend/
│   └── src/ (Express API, models, routes, lib, middleware)
└── mobile/
    └── app/ (expo-router screens & layouts) + components, store, constants, assets
```

---

## Prerequisites

- **Node.js** 18+ and **npm**
- **MongoDB Atlas** account (free) or a local MongoDB
- **Cloudinary** account (for image uploads)
- **Expo** (CLI installed automatically by scripts)

> Tip: If you plan to test on a real phone, connect your phone and computer to the **same Wi-Fi**.

---

## TL;DR (Quick Start)

```bash
# 1) Backend
cd backend
npm install
# create backend .env (see example below)
npm run dev

# 2) Mobile
cd ../mobile
npm install
# set API base URL in mobile/constants/api.js (see notes below)
npx expo start
```

Open the Expo DevTools, then run on iOS simulator, Android emulator, or scan the QR code with the Expo Go app.

---

## 1) Backend Setup

### Install

```bash
cd backend
npm install
```

If `package.json` doesn’t include scripts yet, add:

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon src/index.js"
  }
}
```

Install dev tool:

```bash
npm i -D nodemon
```

### Environment Variables

Create a **`backend/.env`** file:

```ini
# App
PORT=5000

# Database (MongoDB Atlas or local)
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority

# JWT (generate a strong secret with: openssl rand -base64 32)
JWT_SECRET=your_long_random_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# (Optional) CORS
CLIENT_ORIGIN=http://localhost:19006
```

**Notes**
- In MongoDB Atlas: create a **Project → Cluster**, a **Database User**, and allow network access (add your IP or “Access from anywhere” for dev).
- If you run into Mongo connection issues, re-check the `MONGO_URI`, user/password, and IP allowlist.

### Run the API

```bash
npm run dev
```

You should see logs that the server is listening on `http://localhost:5000` and that MongoDB connected.

### API Endpoints (summary)

- `POST /api/auth/register` — create account (`{ email, username, password }`)
- `POST /api/auth/login` — log in, returns JWT + user
- `GET  /api/books?page=<n>&limit=<n>` — list books (paginated)
- `POST /api/books` — create a book (requires `Authorization: Bearer <token>`)
- `DELETE /api/books/:id` — delete book (auth required; also removes Cloudinary image)

---

## 2) Mobile App Setup (Expo)

### Install

```bash
cd mobile
npm install
```

### Configure the API Base URL

Open **`mobile/constants/api.js`** and set your backend URL. For local development:

- If running the app in **iOS simulator** on the same machine: `http://localhost:5000`
- If running on a **real device**, use your computer’s **LAN IP** (find it with `ipconfig`/`ifconfig`), e.g. `http://192.168.1.23:5000`

Example `constants/api.js`:

```js
export const API_URL = "http://192.168.1.23:5000"; // or http://localhost:5000 on simulator
```

> If you use `localhost` on a **physical phone**, requests will fail—use the **LAN IP**.

### Required Expo Packages (already in project)

If needed, (re)install these:

```bash
# Optimized image rendering
npx expo install expo-image

# Image picking & permissions
npx expo install expo-image-picker

# File system (used by some flows in create.js)
npx expo install expo-file-system

# State & storage
npm i zustand @react-native-async-storage/async-storage
```

### Run the App

```bash
npx expo start
```

- Press **i** to launch iOS simulator (macOS), **a** for Android emulator, or scan the QR code with **Expo Go** on your phone.
- First screen is **Login** (under `app/(auth)`); use **Sign up** to create an account, then log in.

---

## How Auth Works (at a glance)

- **Register/Login** calls `authRoutes` on the backend.
- Backend verifies & returns a **JWT**.
- Mobile saves the token using **AsyncStorage** (via **Zustand** store in `mobile/store/authStore.js`).
- Protected actions (e.g., create/delete book) send `Authorization: Bearer <token>`.

---

## Image Uploads (Cloudinary)

- Backend is configured with **Cloudinary** (see `backend/src/lib/cloudinary.js`).
- Creating a book with an image will upload to Cloudinary and store the URL.
- Deleting a book also deletes the Cloudinary asset.

Make sure your Cloudinary credentials are valid in the backend `.env`.

---

## Cron (Keep-Alive) — Optional

If you deploy the API (e.g., on Render), `backend/src/lib/cron.js` can ping the service every ~14 minutes to prevent it from sleeping.  
Local development **does not require** this.

---

## Common Issues & Fixes

**Mobile can’t reach API**
- On a physical device: use your **LAN IP** (not `localhost`) in `API_URL`.
- Ensure computer and phone are on the **same network**.
- Check that the backend port (default **5000**) is not blocked by a firewall.

**MongoDB connection fails**
- Verify `MONGO_URI`, user, password.
- In MongoDB Atlas, **Network Access → Add IP Address** (your current IP or “0.0.0.0/0” for dev).

**CORS errors**
- Add/update `CLIENT_ORIGIN` in backend `.env`, and ensure CORS middleware allows your Expo dev URL (often `http://localhost:19006` or a LAN URL shown by Expo).

**Expo build fails or ports in use**
- Close other Expo instances or free ports `19000–19006`.
- Clear cache: `npx expo start -c`.

---

## Useful cURL Tests (Optional)

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register   -H "Content-Type: application/json"   -d '{"email":"test@example.com","username":"test","password":"secret123"}'

# Login (copy the token from the response)
curl -X POST http://localhost:5000/api/auth/login   -H "Content-Type: application/json"   -d '{"email":"test@example.com","password":"secret123"}'

# Get books (public/paginated)
curl "http://localhost:5000/api/books?page=1&limit=10"

# Create a book (replace TOKEN)
curl -X POST http://localhost:5000/api/books   -H "Authorization: Bearer TOKEN"   -H "Content-Type: application/json"   -d '{"title":"My Book","author":"Me","imageBase64":"data:image/jpeg;base64,<...>"}'
```

---

## Project Structure (for reference)

**Backend**
- `src/index.js` — bootstraps Express, connects DB, mounts routes
- `src/lib/db.js` — Mongo connection
- `src/lib/cloudinary.js` — Cloudinary setup
- `src/lib/cron.js` — optional keep-alive job
- `src/models/User.js`, `src/models/Book.js`
- `src/routes/authRoutes.js`, `src/routes/bookRoutes.js`
- `src/middleware/auth.middleware.js` — JWT protect middleware

**Mobile**
- `app/` — screens & navigation via expo-router  
  - `(auth)/` — login (`index.jsx`) & signup  
  - `(tabs)/` — main app tabs (`index.jsx`, `create.jsx`, `profile.jsx`)  
  - `_layout.jsx` files define stacks/tab layouts and SafeArea handling
- `components/` — `SafeScreen`, `Loader`, `ProfileHeader`, etc.
- `store/` — `authStore.js` (Zustand)
- `constants/` — `api.js` (API base URL), `colors.js`
- `assets/` — fonts, images, styles

---

## That’s It 🎉

Once the backend is running and the Expo app is pointed at the correct `API_URL`, you can:

1. **Sign up**, then **login**
2. **Create** book posts (with images)
3. Browse profile & feed in the tabs

If you get stuck anywhere, tell me what step you’re on and what you’re seeing, and I’ll help you debug quickly.
