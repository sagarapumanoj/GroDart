# GroDart

Hyperlocal delivery platform for Visakhapatnam. Groceries, vegetables, water and snacks, plus the feature that sets it apart: **recipe-based ingredient kits**. Pick a dish and the cart fills with every ingredient, scaled to the number of servings.

**Stack:** React + Vite + Tailwind CSS · Node.js + Express · MongoDB Atlas + Mongoose · OTP + JWT auth

## Features

| Area | Status |
|---|---|
| OTP login (hashed OTPs, expiry, attempt limit, rate limiting) + JWT sessions | Done |
| Product catalogue with search and categories | Done |
| Recipe kits: scale by servings, untick what you already have, one-tap add to cart | Done |
| Cart (add, change quantity, remove, stock checks, delivery fee rules) | Done |
| Orders: place (cash on delivery), history, cancel with stock restore | Done |
| Homepage showcase, offers page, footer, About / Help / Privacy / Terms pages | Done |
| Offers and coupon codes (checked on the server at checkout) | Done |
| Profile: details, email, up to 5 saved addresses, order stats | Done |
| Admin API: manage products, recipes, order status | Done (API only, no UI yet) |
| SMS delivery of OTP | Stub: see `backend/services/sms.js` |
| Online payments (Razorpay) | Planned |
| Vendor dashboard, delivery partner app, live tracking | Planned |
| React Native mobile app | Planned |

## Project structure

```
GroDart/
├── backend/
│   ├── config/        db connection, constants (delivery fee, OTP rules)
│   ├── models/        User, Otp, Product, Recipe, Cart, Order, Offer
│   ├── controllers/   auth, product, recipe, cart, order
│   ├── routes/        all API routes (routes/index.js)
│   ├── middleware/    JWT auth + roles, error handling
│   ├── services/      sms.js (provider stub)
│   ├── seed.js        43 products, 6 recipes, 3 offers
│   └── server.js
└── frontend/
    └── src/ components/ context/ pages/
```

## Run locally

Prerequisites: Node 18+ and a MongoDB Atlas connection string (free tier works).

```bash
# 1. install
npm run install:all

# 2. configure the backend
cp backend/.env.example backend/.env      # then edit MONGO_URI and JWT_SECRET

# 3. load sample data
npm run seed

# 4. start (two terminals)
npm run dev:backend      # http://localhost:5000
npm run dev:frontend     # http://localhost:5173
```

In development the OTP is printed in the backend console and shown on the login screen. In production (`NODE_ENV=production`) it is never returned by the API, so connect an SMS provider first.

To make yourself an admin, set `ADMIN_PHONE` in `backend/.env` before running the seed.

## How recipe kits work

`Recipe.ingredients` stores `{ product, quantity }` where quantity is the number of packs needed for `baseServings`. `POST /api/cart/add-recipe` scales each line (`ceil(qty × servings / baseServings)`), skips anything the customer unticked, caps at available stock, merges into the cart, and returns what could not be added.

## API

| Method | Route | Auth |
|---|---|---|
| POST | `/api/auth/send-otp` · `/api/auth/verify-otp` | – |
| GET / PATCH | `/api/auth/me` (name, email) | user |
| POST / DELETE | `/api/auth/me/addresses` · `/api/auth/me/addresses/:id` | user |
| GET | `/api/offers` | – |
| POST | `/api/offers/validate` (checks a code against your cart) | user |
| GET | `/api/products?category=&search=` · `/api/products/:id` | – |
| GET | `/api/recipes` · `/api/recipes/:id` | – |
| GET / DELETE | `/api/cart` | user |
| POST | `/api/cart/add` · `/api/cart/add-recipe` | user |
| PATCH / DELETE | `/api/cart/item/:productId` | user |
| POST / GET | `/api/orders` · `/api/orders/:id` | user |
| POST | `/api/orders/:id/cancel` | user |
| POST / PUT | `/api/products` · `/api/recipes` · `/api/offers` (`/:id`) | admin |
| GET / PATCH | `/api/orders/admin/all` · `/api/orders/:id/status` | admin |

## Deployment notes

- Backend: set `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET` (long random string), `CLIENT_URL` (your frontend origin).
- Frontend: `npm run build`, host `frontend/dist`, and set `VITE_API_URL` to the backend URL at build time.
- Never commit `.env`.
