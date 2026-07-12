# CollegeKart — Setup Guide

## What was wrong, and what I fixed

The backend (Express + MongoDB) was already well built, but the **entire frontend was a static
design mockup** — Login, Register, Sell, Browse, Product Details and Chat never called the API.
That's why Google login "didn't work": there was no code behind the button at all.

I wired the whole app together end-to-end:

- **Real authentication**: email + password + OTP-verified registration, login, and a real
  Google Sign-In button (Google Identity Services) that exchanges a Google ID token with your
  backend's `/api/auth/google` route. Sessions persist via a JWT in `localStorage`, and every
  private page (`/sell`, `/chat`, `/dashboard`, `/profile`, `/orders`, `/wishlist`, `/admin`) is
  now behind a real login wall.
- **OLX-style listings**: `Sell a Product` now requires a **contact phone number** and a
  **pickup location** (with an optional "Use my current location" GPS pin), uploads real
  photos to Cloudinary, and publishes to MongoDB.
- **Nearby search**: `Browse` has a "Near Me" toggle that uses your browser's geolocation and
  sorts/filters listings by real distance (km) from you, shown right on each card — just like OLX.
- **Buy with a conversation**: every product page has a working "Chat with Seller" button that
  opens a real conversation, a "Show contact number" reveal, an offer box, and a Buy Now (COD)
  flow. Chat is real-time via Socket.IO, with persisted history.
- **Wishlist, Dashboard, Orders, Profile, Admin panel** — all rewired to the real API instead of
  fake sample data.

## 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

## 2. Configure environment variables

Copy the example files and fill them in:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**You must supply these yourself — I can't generate them for you:**

| Variable | Where to get it |
|---|---|
| `MONGO_URI` | A free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas) (or local MongoDB) |
| `JWT_SECRET` | Any long random string, e.g. `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` (server) **and** `VITE_GOOGLE_CLIENT_ID` (client) — **must be the identical value** | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → Create OAuth client ID → **Web application** → add `http://localhost:5173` under *Authorized JavaScript origins* |
| `SMTP_USER` / `SMTP_PASS` | A Gmail account + an [App Password](https://myaccount.google.com/apppasswords) (needed to send the registration OTP email) |
| `CLOUDINARY_*` | Free account at [cloudinary.com](https://cloudinary.com) → Dashboard → copy Cloud name / API key / API secret |

Payment keys (Stripe/Razorpay) and `AI_API_KEY` are optional — the app defaults to Cash on
Delivery / campus meet-up, and the "AI description/price" buttons work with a lightweight
built-in fallback if you don't set `AI_API_KEY`.

## 3. (Optional) Seed demo data

```bash
cd server && node utils/seed.js
```
Creates an admin login (`admin@collegekart.com` / `Admin@12345`), a demo seller
(`demo@collegekart.com` / `Demo@12345`), and 3 sample listings with real coordinates so you can
test "Near Me" immediately.

## 4. Run it

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

Open `http://localhost:5173`.

## Notes / things to double-check

- **Google Sign-In will silently show "not configured"** until `VITE_GOOGLE_CLIENT_ID` in
  `client/.env` is set to a real Client ID *and* `http://localhost:5173` is added as an
  authorized JavaScript origin in Google Cloud Console — otherwise Google's script itself
  rejects the request.
- The registration email/OTP flow needs working SMTP credentials, or new users will never
  receive their verification code.
- Image uploads require valid Cloudinary credentials — without them, `/sell` will fail on submit.
- The "Near Me" feature relies on each listing having `lat`/`lng` saved (via the seller checking
  "Use my current location" when posting, or entering it), and on the buyer's browser granting
  location permission.
