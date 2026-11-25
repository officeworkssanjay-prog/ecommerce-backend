# Store owner (admin) guide

Sign in at `/login` with an admin account; you are taken to `/admin/dashboard`. Only users with the `ADMIN` role can open `/admin/*`, and the API re-checks the role on every request.

| Area | What you do there |
|---|---|
| **Dashboard** | Totals for customers, products, orders, pending orders and paid revenue |
| **Orders** | Filter by status, open an order, move it forward (`Processed → Dropped off/Shipped → Out for delivery → Delivered`) or cancel it (returns stock). Cash-on-delivery orders become paid when delivered, or can be marked paid by hand |
| **Customers** | List, create users (buyer or admin), activate/deactivate. You cannot deactivate yourself or the last active admin |
| **Reviews** | Approve or hide buyer reviews (new reviews are hidden until approved) |
| **Products** | Create/edit/disable products: category → sub-category → child category, brand, image, stock, price, offer price with dates, SEO fields. A product that has been ordered cannot be deleted: disable it instead |
| **Categories / Brands** | Manage the catalogue structure. A category with products cannot be deleted |
| **Coupons** | Code, percentage or fixed discount, validity dates, total quantity and per-customer limit |
| **Flash sale, Hero sliders, Banners** | Home-page promotions |
| **Newsletter** | Subscriber list. Sending broadcasts is not configured yet (the page says so) |
| **Messages** | Contact-form enquiries: read, mark unread, reply by email, delete |
| **Blog posts / Comments** | Publish articles; approve or delete comments |
| **Shipping** | Flat-cost rules, or rules that apply only above a minimum order value |
| **Settings** | Store name/contact/currency, SMTP and Pusher (secrets are write-only: shown masked), Razorpay options and cash on delivery |

Tips

- Slugs (URLs) are created from the name and never change when you rename an item, so existing links keep working.
- Image uploads: PNG, JPEG, WebP or GIF up to 5 MB.
- Messages such as "is in use and cannot be deleted" mean other records depend on the item; disable it instead.
