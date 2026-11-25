# API reference

Base URL: `/api` (through the web app) or `http://localhost:5000/api` (direct). JSON in, JSON out.

- **Auth:** a login sets the `auth_token` HttpOnly cookie; `Authorization: Bearer <token>` also works. "signed in" = any user; "admin" = `ADMIN` role.
- **Success:** `{ "success": true, "message"?, "data": … }` (auth endpoints also return `user`/`token`; uploads return `url`).
- **Errors:** `{ "success": false, "message": "…", "errors"?: { "field": ["…"] } }` with status `400` validation · `401` not signed in · `403` forbidden · `404` · `409` conflict (duplicate / in use / out of stock) · `429` rate limited · `5xx`.
- **Validation:** schemas live in `packages/shared-types/src` and are the single source of truth for field rules. Money is a plain number with two decimals.
- A ready-to-run Postman collection is in `postman_collection.json` (generated from the same table as this page).

## Auth

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | public | **Register.** Password: 8-72 chars, a letter and a number. Sets the login cookie. |
| POST | `/api/auth/login` | public | **Login.** Sets the `auth_token` HttpOnly cookie (also returned as `token`). |
| GET | `/api/auth/me` | signed in | **Current user.**  |
| POST | `/api/auth/logout` | public | **Logout.**  |

## Storefront

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/storefront/home` | public | **Home page data.** Sliders, categories, flash sale, brands, new arrivals, featured products. |
| GET | `/api/storefront/products` | public | **List products.** sort: newest, price_low, price_high, popular. Empty values are ignored. |
| GET | `/api/storefront/products/:slug` | public | **Product by slug.**  |
| GET | `/api/storefront/flash-sale` | public | **Flash sale.**  |
| GET | `/api/storefront/categories` | public | **Categories.**  |
| GET | `/api/storefront/brands` | public | **Brands.**  |
| GET | `/api/storefront/shipping-rules` | public | **Shipping rules.**  |
| GET | `/api/storefront/advertisements` | public | **Advertisements.**  |
| GET | `/api/storefront/blogs` | public | **Blog list.**  |
| GET | `/api/storefront/blogs/:slug` | public | **Blog by slug.**  |
| POST | `/api/storefront/blogs/:id/comments` | signed in | **Comment on a blog.**  |
| POST | `/api/storefront/newsletter-subscribe` | public | **Newsletter subscribe.** Rate limited. 409 if already subscribed. |
| GET | `/api/storefront/newsletter-verify/:token` | public | **Newsletter verify.**  |
| POST | `/api/storefront/contact` | public | **Contact form.** Rate limited. Saved to the admin inbox. |

## Orders

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/api/order/calculate-pricing` | public | **Calculate pricing (cart preview).** Prices come from the database; any client prices are ignored. |
| POST | `/api/order/checkout` | signed in | **Checkout.** paymentMethod: COD or RAZORPAY. RAZORPAY returns `gateway` for Razorpay Checkout. |
| POST | `/api/order/payment/verify` | signed in | **Verify Razorpay payment.** Marks the order PAID only if the signature is valid. |
| POST | `/api/order/:id/cancel` | signed in | **Cancel own order.** Only PENDING + unpaid orders. |
| GET | `/api/order/user/orders` | signed in | **My orders.**  |
| GET | `/api/order/track/:invoiceId` | public | **Track order (guest).** Needs the invoice number and the order email. |

## Account

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/user/profile` | signed in | **Profile.**  |
| PUT | `/api/user/profile` | signed in | **Update profile.** phone "" clears it. |
| POST | `/api/user/change-password` | signed in | **Change password.**  |
| GET | `/api/user/addresses` | signed in | **List addresses.**  |
| POST | `/api/user/addresses` | signed in | **Create address.** Max 10 per account; the first one is the default. |
| PUT | `/api/user/addresses/:id` | signed in | **Update address.**  |
| DELETE | `/api/user/addresses/:id` | signed in | **Delete address.**  |
| PUT | `/api/user/addresses/:id/default` | signed in | **Set default address.**  |
| GET | `/api/user/wishlist` | signed in | **Wishlist.**  |
| POST | `/api/user/wishlist/:productId` | signed in | **Add to wishlist.**  |
| DELETE | `/api/user/wishlist/:productId` | signed in | **Remove from wishlist.**  |
| GET | `/api/user/reviews` | signed in | **My reviews.**  |
| POST | `/api/user/reviews` | signed in | **Write a review.** Only after a delivered order containing the product; one per product. |

## Chat

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/chat/support-agent` | signed in | **Support agent.** The admin a buyer should message. |
| GET | `/api/chat/conversations` | signed in | **Conversations.**  |
| GET | `/api/chat/messages/:receiverId` | signed in | **Messages with a user.** Buyers can only chat with the store admin. |
| POST | `/api/chat/send` | signed in | **Send message.**  |

## Upload

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/api/upload` | signed in | **Upload image.** multipart/form-data field `image` (or JSON `{ image: dataUrl }`). PNG/JPEG/WebP/GIF, 5MB. Returns `url`. |

## Admin: overview

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/admin/dashboard` | admin | **Dashboard.**  |
| GET | `/api/admin/orders` | admin | **Orders.**  |
| PUT | `/api/admin/orders/:id/status` | admin | **Update order status.** Transitions are enforced; CANCELED restocks. |
| GET | `/api/admin/users` | admin | **Users.**  |
| POST | `/api/admin/users` | admin | **Create user.**  |
| PUT | `/api/admin/users/:id/status` | admin | **Activate / deactivate user.** Not yourself, not the last admin. |
| GET | `/api/admin/reviews` | admin | **Reviews.**  |
| PUT | `/api/admin/reviews/:id/status` | admin | **Approve / hide review.**  |

## Admin: catalogue

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/admin/products` | admin | **Products.**  |
| POST | `/api/admin/products` | admin | **Create product.** PUT /admin/products/:id takes any subset. DELETE returns 409 if ordered. |
| GET | `/api/admin/categories` | admin | **Categories.** Same shape for /sub-categories and /child-categories (parent id required). |
| POST | `/api/admin/categories` | admin | **Create category.** PUT/DELETE /admin/categories/:id |
| GET | `/api/admin/brands` | admin | **Brands.** POST/PUT/DELETE: { name, logo?, isFeatured?, status? } |

## Admin: marketing

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/admin/coupons` | admin | **Coupons.**  |
| POST | `/api/admin/coupons` | admin | **Create coupon.** PUT/DELETE /admin/coupons/:id |
| GET | `/api/admin/flash-sale` | admin | **Flash sale.**  |
| PUT | `/api/admin/flash-sale` | admin | **Update flash sale.**  |
| POST | `/api/admin/flash-sale/products` | admin | **Add flash-sale product.** DELETE /admin/flash-sale/products/:id removes one. |
| GET | `/api/admin/sliders` | admin | **Sliders.** POST/PUT/DELETE: { banner, type?, title?, startingPrice?, btnUrl?, serial?, status? } |
| GET | `/api/admin/advertisements` | admin | **Advertisements.**  |
| PUT | `/api/admin/advertisements` | admin | **Update advertisement.**  |
| GET | `/api/admin/subscribers` | admin | **Newsletter subscribers.**  |
| POST | `/api/admin/subscribers/send-mail` | admin | **Send newsletter.** Returns 501 until an email transport is configured. |

## Admin: content

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/admin/blog-categories` | admin | **Blog categories.** POST/PUT/DELETE: { name, status? } |
| GET | `/api/admin/blogs` | admin | **Blogs.** POST/PUT/DELETE: { categoryId, title, image, description, seoTitle?, seoDescription?, status? } |
| GET | `/api/admin/messages` | admin | **Contact messages.** Contact-form inbox. PUT /:id { isRead }, DELETE /:id |
| GET | `/api/admin/blog-comments` | admin | **Blog comments.** PUT /:id/status { status }, DELETE /:id |

## Admin: store

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/admin/shipping-rules` | admin | **Shipping rules.** POST/PUT/DELETE: { name, type: flat_cost\|min_cost, minCost?, cost, status? } |
| GET | `/api/admin/settings` | admin | **Settings.** Secrets are masked. |
| PUT | `/api/admin/settings/general` | admin | **Update general settings.**  |
| PUT | `/api/admin/settings/email` | admin | **Update email settings.** Blank/masked password keeps the stored one. |
| PUT | `/api/admin/settings/payment-gateways` | admin | **Update payment gateway.** gateway: RAZORPAY or COD. |

