# Multi-Vendor E-Commerce Platform (Turborepo Monorepo)

A high-performance, full-featured multi-tenant marketplace platform migrated from PHP/Laravel 10 to a modern TypeScript stack:
- **Frontend (`apps/web`)**: Next.js 14/15 (App Router), Tailwind CSS, shadcn/ui, TanStack Table v8, Lucide Icons, Zustand.
- **Backend (`apps/api`)**: Node.js, Express, TypeScript, JWT Auth & RBAC, Zod validation, WebSockets, Payment Gateway integrations (Stripe, PayPal, Razorpay, COD).
- **Database (`packages/database`)**: PostgreSQL with Prisma ORM, native `JSONB` for immutable checkout snapshots, 54 domain models, seeding scripts.
- **Shared Types (`packages/shared-types`)**: Shared TypeScript interfaces, DTOs, and Zod schemas.

---

## 🏛️ Monorepo Architecture

```text
ecommerce-backend/
├── apps/
│   ├── api/                          # Node.js + Express API Backend
│   │   ├── src/
│   │   │   ├── controllers/          # Admin, Vendor, Customer, Storefront, Order controllers
│   │   │   ├── middlewares/          # Auth JWT & Role-based Access Control (RoleMiddleware)
│   │   │   ├── routes/               # Modular Express endpoints
│   │   │   ├── services/             # Atomic checkout, inventory decrement, order snapshotting
│   │   │   ├── utils/                # Pricing, coupon discount & shipping calculation engine
│   │   │   └── server.ts             # Express server entry point
│   │   └── package.json
│   │
│   └── web/                          # Next.js App Router Frontend
│       ├── src/
│       │   ├── app/                  # (storefront), (customer), (vendor), (admin) route groups
│       │   ├── components/
│       │   │   ├── ui/               # shadcn/ui primitives (Button, Card, Table, Badge, Dialog)
│       │   │   └── tables/           # Reusable TanStack Table (Yajra DataTable replacement)
│       │   └── store/                # Zustand client cart & wishlist store with LocalStorage sync
│       └── package.json
│
├── packages/
│   ├── database/                     # PostgreSQL Prisma ORM
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Unified schema covering all 54 domain models
│   │   │   └── seed.ts               # Seed data for Admin, Vendor, Customer, and Settings
│   │   └── src/index.ts              # Singleton PrismaClient export
│   │
│   └── shared-types/                 # Shared TypeScript interfaces & Zod validation
│       └── src/                      # Auth, Order, Product, Vendor, Chat schemas
│
├── docs/                             # Original technical specifications and route references
├── turbo.json                        # Turborepo task pipeline configuration
└── package.json                      # Workspace root configuration
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: `v18.x` or `v20.x`
- **NPM**: `v9.x` or `v10.x`
- **PostgreSQL**: `v14+` running locally or via Docker / Supabase / Neon

### 2. Install All Monorepo Dependencies
From the repository root:
```bash
npm install
```

### 3. Configure PostgreSQL Database
Create a `.env` file in the root or in `packages/database/.env`:
```ini
DATABASE_URL="postgresql://postgres:password@localhost:5432/ecommerce_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
FRONTEND_URL="http://localhost:3000"
PORT=5000
```

### 4. Push Schema & Seed Initial Data
```bash
# Push Prisma schema to PostgreSQL
npm run db:push

# Seed default Admin, Vendor, Customer, Categories & Payment Settings
npm run db:seed
```

> **Default Seed Accounts:**
> - **Admin**: `admin@gmail.com` / `password`
> - **Vendor**: `vendor@gmail.com` / `password`
> - **Customer**: `user@gmail.com` / `password`

### 5. Launch Development Servers (Turborepo)
```bash
npm run dev
```
- **Storefront & Portals**: `http://localhost:3000`
- **Node.js Express API**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/health`

---

## 🗄️ Database Domain Highlights

- **Multi-Role Tenant RBAC**: `Role` enum (`ADMIN`, `VENDOR`, `USER`) guarded by `requireRole()`.
- **Immutable JSON Snapshots**: Orders preserve frozen snapshots (`orderAddress`, `shippingMethod`, `coupon`, `variants`) directly in PostgreSQL `JSONB` columns.
- **Atomic Checkout**: Transaction runner handles line item verification, inventory decrements (`product.qty -= item.qty`), and financial transaction records inside an atomic `prisma.$transaction()`.
- **Logistics State Machine**: 7-stage order progression (`PENDING` -> `PROCESSED_AND_READY_TO_SHIP` -> `DROPPED_OFF` -> `SHIPPED` -> `OUT_FOR_DELIVERY` -> `DELIVERED` -> `CANCELED`).
- **Vendor Earnings Unlocking**: Withdrawable balances are strictly unlocked only when an order is marked both **Paid** and **Delivered**.
