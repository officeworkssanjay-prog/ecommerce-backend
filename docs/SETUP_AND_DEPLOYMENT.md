# Setup and deployment

## Local development

See the Quick start in the [README](../README.md). Environment variables are documented in `.env.example`.

| Variable | Used by | Notes |
|---|---|---|
| `DATABASE_URL` | database, API | PostgreSQL connection string |
| `JWT_SECRET` | API | **required**, 32+ random characters |
| `PORT` | API | default 5000 |
| `FRONTEND_URL` | API | CORS origin (only relevant if the browser calls the API directly) |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | API | optional; enables online payments |
| `BACKEND_ORIGIN` | web app | where `/api/*` and `/uploads/*` are proxied, default `http://localhost:5000` |
| `NEXT_PUBLIC_CURRENCY_CODE`, `NEXT_PUBLIC_LOCALE` | web app | price formatting, default `INR` / `en-IN` |

The API reads `.env` from its working directory (`apps/backend/.env`); the Prisma CLI reads `packages/database/.env` or the root `.env`.

## Database

```bash
npm run db:migrate:deploy   # apply committed migrations (use this in every environment)
npm run db:migrate          # dev only: create a new migration after changing schema.prisma
npm run db:seed             # sample catalogue and the two demo accounts; idempotent
```

Migrations include hand-written `CHECK` constraints (`packages/database/prisma/migrations/*_db_hardening`). Do not use `db push` on a real database: it skips them.

## Tests

```bash
npm test        # Vitest + Supertest against the real database in DATABASE_URL
```

The API tests create their own rows and remove them afterwards, but they do run against whatever database `DATABASE_URL` points to: use a development database, never production.

## Production checklist

1. Build: `npm run build` (packages first, then the API and the web app).
2. Set a strong `JWT_SECRET`, `NODE_ENV=production` (enables `Secure` cookies and generic 5xx messages), real `DATABASE_URL`, and Razorpay keys if you take online payments.
3. Change or delete the seeded demo accounts; create your own admin (`npm run db:seed` is for development data).
4. Run `prisma migrate deploy` on release.
5. Serve the web app over HTTPS and point `BACKEND_ORIGIN` at the API (private network is fine: browsers only see the web app's origin).
6. Persist the API's `uploads/` directory (volume or object storage); uploaded images live there.
7. Back up PostgreSQL.

## Troubleshooting

- *API exits with `Missing required environment variable: JWT_SECRET`*: add it to `apps/backend/.env`.
- *Login works but `/account` redirects to login*: the browser must receive the `auth_token` cookie from the same origin as the web app; call the API through `/api` (the default), not a different host.
- *Port 3000 busy*: Next picks the next free port; open the URL it prints.
