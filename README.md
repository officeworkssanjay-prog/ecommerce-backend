# Sawariya Jewels: e-commerce platform

A jewellery store with a buyer storefront and a store-owner admin panel. TypeScript monorepo (Turborepo):

| Package | What it is |
|---|---|
| `apps/frontend` | Next.js 16 (App Router) + Tailwind CSS 4 storefront, buyer account area and admin panel |
| `apps/backend` | Express + TypeScript REST API (JWT cookie auth, Zod validation, Prisma) |
| `packages/database` | Prisma schema, migrations, seed, shared `prisma` client (PostgreSQL) |
| `packages/shared-types` | Zod schemas and types shared by the API and the web app |

**Two roles only:** `ADMIN` (the store owner) and `USER` (a buyer). There is no vendor or marketplace tier.

## Quick start

Prerequisites: Node 20+, npm 10+, PostgreSQL 14+ (a Docker one-liner is below).

```bash
# 1. Install
npm install

# 2. Database (example: Docker on port 5433)
docker run -d --name ecommerce_postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ecommerce_db \
  -p 5433:5432 -v ecommerce_pgdata:/var/lib/postgresql/data postgres:16-alpine

# 3. Configure: copy .env.example to .env (root) and to apps/backend/.env, then set JWT_SECRET
#    (generate one: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 4. Create tables + sample data
npm run db:generate
npm run db:migrate:deploy
npm run db:seed

# 5. Run everything (API on :5000, web app on :3000)
npm run dev
```

Seed accounts (development only, change them before going live):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@sawariyajewels.com` | `admin123` |
| Buyer | `collector@gmail.com` | `user123` |

The web app calls the API through its own origin (`/api/*` is proxied to `BACKEND_ORIGIN`), so login cookies are first-party and no CORS setup is needed.

## Everyday commands

```bash
npm run dev          # API + web app
npm run build        # production build of every package
npm run typecheck    # tsc for every package
npm run lint         # eslint (web) + tsc
npm test             # API tests (need the database running)
npm run db:migrate   # create a new migration after editing schema.prisma
npm run db:seed      # idempotent: safe to run repeatedly
```

## How it works

- **Validation everywhere.** Every request body, query and URL parameter is validated with a Zod schema from `packages/shared-types` before a controller runs (`apps/backend/src/middlewares/validate.ts`). Failures return `400` with per-field messages that the forms display. The database repeats the important rules as `CHECK` constraints (no negative stock or prices, ratings 1-5, coupon limits, lowercase emails …).
- **The server decides prices.** A cart is only product ids, quantities and chosen options. Prices, offers, stock, coupons and shipping are recalculated on the server from the database (`services/pricing.service.ts`); money is stored as `DECIMAL(12,2)`.
- **Safe checkout.** Orders are created in one transaction with guarded stock and coupon updates, so two buyers cannot take the last item. Cash on delivery or Razorpay; an online order is marked paid only after its payment signature is verified (`services/checkout.service.ts`, `razorpay.service.ts`).
- **Order lifecycle.** `PENDING → PROCESSED_AND_READY_TO_SHIP → DROPPED_OFF → SHIPPED → OUT_FOR_DELIVERY → DELIVERED`, with `CANCELED` allowed early. Illegal jumps are rejected; cancelling returns stock and coupon uses.
- **Route guards.** `apps/frontend/proxy.ts` protects `/account`, `/checkout` and `/admin` (admins are verified against the API); the API enforces roles again on every endpoint.

More detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/API.md](docs/API.md) · [docs/PAYMENT_AND_CHECKOUT.md](docs/PAYMENT_AND_CHECKOUT.md) · [docs/SETUP_AND_DEPLOYMENT.md](docs/SETUP_AND_DEPLOYMENT.md) · [docs/ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) · Postman: `postman_collection.json`.
