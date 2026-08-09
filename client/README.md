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

