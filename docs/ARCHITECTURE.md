# Architecture

```
Browser ──► Next.js (apps/frontend :3000)
              │  /api/*      proxied ─────────►  Express API (apps/backend :5000) ──► PostgreSQL (Prisma)
              │  /uploads/*  proxied ─────────►  (serves uploaded images)
              └─ proxy.ts guards /account, /checkout, /admin
```

The browser never talks to the API origin directly. Next.js rewrites `/api/*` and `/uploads/*` to `BACKEND_ORIGIN` (`apps/frontend/next.config.ts`), so the HttpOnly login cookie (`auth_token`) is first-party and CORS is not involved. The API sets `trust proxy` so rate limits see the real client IP.

## Packages

- **`packages/shared-types`**: Zod schemas for every input (auth, address, cart/checkout, reviews, contact, chat, every admin form, settings) and the inferred types. Both the API (`validate()` middleware) and the web forms (`zodResolver`) use the same schema, so rules never drift.
- **`packages/database`**: `prisma/schema.prisma`, SQL migrations (including `CHECK` constraints), the seed, and a singleton client. `Decimal` columns serialise to JSON numbers.
- **`apps/backend`** (`src/`)
  - `config/env.ts`: validated environment; the process will not start without `JWT_SECRET`.
  - `middlewares/`: `auth` (JWT from cookie or `Authorization: Bearer`, user reloaded on every request so deactivation is immediate), `role` (`requireRole("ADMIN")`), `validate`, `rate-limit`, `error` (one place that maps Zod/Prisma/app errors to JSON).
  - `routes/` → `controllers/` → `services/`: checkout, pricing, Razorpay, order-status rules.
  - `utils/`: `AppError`, `asyncHandler`, slug generation.
- **`apps/frontend`**: App Router pages; `lib/api.ts` (typed client that throws `ApiError`), `lib/useApi.ts`, `components/ui/*` (design-system primitives), `components/admin/*`, `context/` (auth, cart), `proxy.ts` (route guard).

## Request lifecycle (API)

`helmet → CORS → JSON/cookies → rate limit (selected routes) → route → authenticate → requireRole → validate(body/query/params) → controller → service → Prisma → JSON`.
Every failure is an `AppError`/Zod/Prisma error handled by `error.middleware.ts`:
`400` validation (with `errors: { field: [messages] }`), `401` not signed in, `403` forbidden, `404`, `409` conflict (duplicate / in use / out of stock), `5xx` generic message in production.

## Data model highlights

- Roles: `ADMIN`, `USER`. Users can be deactivated (`status=false`).
- Catalogue: `Category → SubCategory → ChildCategory`, `Brand`, `Product` (+ variants, variant items, gallery). Money is `DECIMAL(12,2)`; stock is an integer with `CHECK (qty >= 0)`.
- Orders: `Order` + `OrderProduct` + `Transaction`. Address, shipping method and coupon are stored as JSON **snapshots** so later edits never change history. `invoiceId` is a unique 6-digit number; `gatewayOrderId` links to the Razorpay order.
- Social/content: wishlist, reviews (moderated, one per buyer per product), blogs and comments (moderated), chat (buyer ↔ admin), flash sale, sliders, banners, newsletter.
- Database-enforced rules: non-negative stock/prices, offer price ≤ price, rating 1-5, coupon quantity/dates/percentage, no self-chat, lowercase emails, unique review per user/product.

## Security model

- Passwords: bcrypt, 8-72 chars with a letter and a number (login has no policy so older accounts still work). Login compares against a dummy hash for unknown emails and returns the same message either way.
- Sessions: JWT in an HttpOnly, `SameSite=Lax` cookie (`Secure` in production), 7 days. `GET /auth/me` returns the current user.
- Authorisation: every buyer query is scoped to `req.user.id`; admin routes sit behind `requireRole("ADMIN")`; the last active admin cannot be deactivated.
- Uploads: PNG/JPEG/GIF/WebP only, ≤ 5 MB, content-sniffed (not trusting mime/extension), random filenames, no SVG.
- Rate limits on login, register, contact, newsletter, order tracking, chat and upload.
- Secrets (SMTP/Pusher passwords) are never returned by the settings API (masked); Razorpay keys live only in environment variables.

## Known gaps

- Newsletter broadcasts and replies by email need an email transport that is not built yet (the API says so explicitly). Contact-form messages are stored in an admin inbox.
- Product variants and image galleries can be edited only through the database/seed (no admin endpoints yet).
- The storefront follows the Figma (`docs/design/figma-spec.md` records what was read from it). Not yet read from the Figma: the Necklace, Earrings, Rings, Bridal, Anklets & Others and Sale category sections (they use working copy marked `TODO(figma)` in `components/catalog/category-content.ts`) and the mobile menu and filter drawers. Features the design shows but the backend does not have (prepaid discount, COD fee, gift wrap, pincode check, OTP/guest checkout, courier tracking, notify-me) are not built.
