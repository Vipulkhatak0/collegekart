# CollegeKart

**Buy. Sell. Save. Campus to Campus.**

A MERN-stack marketplace exclusively for college students to buy and sell used or new products safely within their campus.

## What's included

**Frontend** (`/client` — React + Vite + Tailwind + Framer Motion)
- All 15 pages: Home, Browse Products, Categories, Product Details, Sell Product, Wishlist, Chat, Orders, Dashboard, Profile, Notifications, About, Contact, Help Center, Admin Panel, plus Login/Register
- Dark/light mode toggle (persisted)
- Glassmorphism cards, blue-purple gradient theme, mobile-first responsive layout
- Mock data so the UI is fully browsable out of the box, before connecting the backend
- PWA support via `vite-plugin-pwa`

**Backend** (`/server` — Node + Express + MongoDB)
- JWT authentication + student email OTP verification + Google OAuth endpoint
- Product CRUD with search, category filters, sorting, image upload to Cloudinary
- Orders with Stripe and Razorpay payment intent creation, plus Cash on Delivery / meet-up
- Real-time chat scaffold via Socket.io
- Reviews model, wishlist, report-listing endpoint
- Admin routes for user/listing management and stats
- AI description & price-suggestion endpoints — currently stubbed with simple logic; wire these to your AI provider of choice

## What you still need to configure

These require your own accounts/API keys — the code is wired up and ready, just add credentials to `.env`:

| Feature | Service needed |
|---|---|
| Image uploads | Cloudinary account (free tier works) |
| Google Login | Google Cloud OAuth Client ID |
| OTP emails | Any SMTP provider (Gmail app password works for testing) |
| Card payments | Stripe account (test mode keys) |
| UPI/India payments | Razorpay account (test mode keys) |
| AI description/price suggestion | Any LLM API (Anthropic, OpenAI, etc.) — see `productRoutes.js` for the two stub endpoints to wire up |

## Getting started

```bash
# 1. Install everything
npm run install:all

# 2. Configure environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# then fill in real values in both files

# 3. Seed the database with an admin user + sample products
npm run seed

# 4. Run both apps (in two terminals)
npm run dev:server
npm run dev:client
```

Frontend runs at `http://localhost:5173`, backend API at `http://localhost:5000/api`.

Default seeded admin login: `admin@collegekart.com` / `Admin@12345`

## Connecting frontend to backend

Right now the frontend pages use mock data from `client/src/data/mockData.js` so the UI works standalone. To go live:
1. Point the frontend at your API using `axios` calls to `import.meta.env.VITE_API_URL`
2. Replace the mock data imports in each page with real `useEffect`/`fetch` calls to the matching backend route
3. Store the JWT from login/OTP-verify in memory or an httpOnly cookie (avoid `localStorage` for tokens in production — it's vulnerable to XSS)

## Hosting suggestions

- **Frontend**: Vercel or Netlify (auto-deploys from Git, free tier is generous)
- **Backend**: Render or Railway (free/low-cost Node hosting with env var support)
- **Database**: MongoDB Atlas (free tier, 512MB)

## Notes on the design

- Colors: primary blue `#3B5FE3` → purple `#8B5CF6` gradient, used sparingly as accents rather than everywhere
- Typography: Sora (display/headings) + Inter (body) — loaded via Google Fonts in `index.html`
- Signature element: product cards have a small "ID card" notch at the top, echoing a campus ID badge, to tie the marketplace visually back to student life
