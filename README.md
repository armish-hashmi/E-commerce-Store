
# Online Store

A full-stack e-commerce app built with Next.js , MongoDB/Mongoose, and Stripe Checkout — with a full admin panel for managing products and categories.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** MongoDB via Mongoose
- **Auth:** JWT (`jose`) stored in an `httpOnly` cookie, verified in `proxy.ts`
- **Payments:** Stripe Checkout Sessions + webhooks
- **Styling:** Tailwind CSS

## Features

### Storefront
- Home page with dynamic featured categories and products (DB-backed, falls back to mock data if empty)
- Product listing with search, category filtering (URL-aware via `?category=`), and dynamic category buttons
- Product detail pages
- Cart with quantity controls, persisted to `localStorage`
- Wishlist
- Stripe-powered checkout with a confirmation/success page
- Contact form (saved to DB)
- Signup / Login / Logout

### Admin Panel (`/admin`)
- Protected by JWT-based auth (`proxy.ts` redirects non-admins to `/login`)
- Responsive layout: sidebar on desktop, hamburger slide-in menu on mobile
- **Dashboard** — read-only overview of live products and categories
- **Products** — full CRUD, plus a one-time "Seed Mock Products" action to migrate the starter catalog into the database
- **Categories** — full CRUD (name, image URL)
- Logout button (clears the auth cookie)

## Getting Started

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Auth
JWT_SECRET=a_long_random_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```


### Run the dev server

```bash
npm run dev
```

### Seed an admin account

Hit this endpoint once to create/update the primary admin login:

```
GET /api/admin/seed-admin
```

Default credentials it creates:
- Email: `admin@store.com`
- Password: `admin123!`

**Change these before deploying to production.**

### Seed the product catalog

Once logged in as admin, go to `/admin/products` and click **"Get Store Products"** to copy the starter catalog (`data/mockData.ts`) into the database.

### Stripe webhook (local development)

Install the [Stripe CLI](https://docs.stripe.com/stripe-cli) and run:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` secret it prints into `STRIPE_WEBHOOK_SECRET`.
