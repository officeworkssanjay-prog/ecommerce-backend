# Merchant & Administrator Operations Guide

This guide is the complete operational runbook for **Merchants (Vendors)** running their shops and **System Administrators** governing the marketplace.

---

## 👥 Role Scope & Permissions Comparison

| Operational Capability | Customer | Vendor | Admin |
| :--- | :---: | :---: | :---: |
| Browse store, cart & place orders | ✅ | ✅ | ✅ |
| Submit Vendor application | ✅ | *(Already Vendor)* | *(N/A)* |
| Manage personal shop profile & banners | ❌ | ✅ | ✅ |
| Create products & variants | ❌ | ✅ *(Pending moderation)* | ✅ *(Auto-approved)* |
| Moderate vendor products | ❌ | ❌ | ✅ |
| Pack orders (`processed_and_ready_to_ship`)| ❌ | ✅ *(Own items only)* | ✅ *(All items)* |
| Advance logistics (`shipped`, `delivered`)| ❌ | ❌ | ✅ |
| Request earnings withdrawal | ❌ | ✅ | ❌ |
| Configure payout methods & approve withdrawals | ❌ | ❌ | ✅ |
| Manage site settings, SMTP, Pusher & Gateways | ❌ | ❌ | ✅ |
| Configure Flash Sales, Banners & Homepage | ❌ | ❌ | ✅ |

---

## 🏬 Part 1: Merchant (Vendor) Operations Manual

### 1. Onboarding & Vendor Application
1. Sign up or log into a customer account.
2. Navigate to **Customer Dashboard &rarr; Vendor Request** (`/user/vendor-request`).
3. Review the **Vendor Conditions and Policies**.
4. Fill in:
   - **Shop Banner**: Recommended size `1200x400px` (PNG, JPG, WebP &le; 3MB).
   - **Shop Name**: Public store branding.
   - **Shop Email & Phone**: Official customer support contact.
   - **Shop Address & About Description**: Business biography.
5. Click **Submit**. Your application is routed to the Admin Moderation Queue with status `Pending`.

---

### 2. Shop Customization (`/vendor/shop-profile`)
Once approved by an administrator, access your dedicated merchant panel at `/vendor/dashboard`.
- Configure your **Shop Banner**, **Logo**, **Social Media Profiles** (Facebook, Twitter, Instagram), and **Store Operating Address**.
- This information populates your public merchant store page at `/vendor-product/{vendor_id}`.

---

### 3. Product Catalog Management (`/vendor/products`)

#### Step 1: Basic Information
- **Thumbnail Image**: Main storefront image (`public/uploads/vendorproducts`).
- **Product Name & Slug**: Automatically slugified.
- **Category Taxonomy**: Dynamic dependent dropdowns (select Category &rarr; Subcategory loads &rarr; Child Category loads).
- **Brand**: Select the manufacturer/brand.
- **Stock Quantity (`qty`)**: Available inventory. The system auto-decrements on order placement.
- **Base Price & Offer Price**: Define regular price and temporary discount price with `offer_start_date` and `offer_end_date`.
- **Product Badges**: Select product type:
  - `new_arrival`
  - `featured_product`
  - `top_product`
  - `best_product`
- **SEO Meta Title & Description**: For search engine indexing.

> [!NOTE]
> All vendor-created products are saved with `is_approved = 0`. The product remains invisible on the public storefront until an administrator approves it.

#### Step 2: Product Image Gallery (`/vendor/products-image-gallery`)
- Upload multiple supplementary product images.
- Showcases different angles, packaging, and lifestyle shots.

#### Step 3: Product Variants & Items (`/vendor/products-variant`)
Variants allow offering options like Size, Color, or Material:
1. Click **Create Variant** (e.g. name: `Size`, status: `Active`).
2. Click **Manage Variant Items** (`/vendor/products-variant-item/{productId}/{variantId}`).
3. Add options under the variant:
   - Item Name: `XL`
   - Price: `5.00` *(Extra amount added to the product base price)*
   - Is Default: `Yes` or `No`
   - Status: `Active`

---

### 4. Order Management & Fulfillment (`/vendor/orders`)
- Vendors see only orders that include items from their store.
- Click **Show** (`/vendor/orders/show/{id}`) to view ordered items, selected variant choices, line item subtotal, and shipping address.
- **Order Status Update**: Once packed and boxed, change status to:
  - `Processed and ready to ship`
- Admin logistics partners handle parcel collection and subsequent transitions (`dropped_off`, `shipped`, `delivered`).

---

### 5. Merchant Earnings & Withdrawals (`/vendor/withdraw`)

#### How Withdrawable Balance is Calculated:
```text
Withdrawable Balance = Total Delivered Paid Earnings - (Approved Withdrawals + Pending Withdrawals)
```
- Only orders marked **Paid (`payment_status = 1`)** and **Delivered (`order_status = 'delivered'`)** count towards earnings.
- When submitting a request:
  1. Navigate to `/vendor/withdraw/create`.
  2. Select an admin-approved **Payout Method** (e.g. Bank Transfer, PayPal).
  3. Enter the requested amount: Must fall between the method's `minimum_amount` and `maximum_amount`.
  4. Platform withdrawal charges are calculated automatically:
     $$\text{Withdrawal Charge} = \text{Amount} \times \left(\frac{\text{Withdraw Charge \%}}{100}\right)$$
     $$\text{Merchant Payout} = \text{Amount} - \text{Withdrawal Charge}$$
  5. Provide payout account details (IBAN, account number, or email).
  6. **Constraint**: Merchants may only have **one** pending withdrawal request at a time.

---

### 6. Real-Time Customer Chat (`/vendor/messages`)
- Communicate with customers inquiring about products or orders.
- Receive instant message popups powered by Pusher WebSockets.

---

## 🛡️ Part 2: Platform Administrator Operations Manual

### 1. Vendor Application Approval (`/admin/vendor-requests`)
1. View pending merchant applications.
2. Click **Show** to inspect legal business details, shop banner, and contact information.
3. Select status:
   - `1` (Approved): Automatically updates the applicant's account role to `vendor` and enables their shop.
   - `0` (Rejected).

---

### 2. Product Moderation Queue (`/admin/seller-pending-products`)
- Review newly created or updated vendor items before they appear to shoppers.
- Inspect pricing, imagery, category placement, and descriptions.
- Toggle **Approve Status** to `Approved`. The product goes live instantly across the marketplace.

---

### 3. Orders & Logistics Workflow (`/admin/order`)
Administrators hold global logistics authority to update orders through all 7 stages:
1. `pending`: Order placed, waiting processing.
2. `processed_and_ready_to_ship`: Goods packaged.
3. `dropped_off`: Received from seller.
4. `shipped`: Dispatched via logistics courier.
5. `out_for_delivery`: Courier out for customer drop-off.
6. `delivered`: Customer accepted delivery. *(Unlocks vendor earnings)*.
7. `canceled`: Order refunded/voided.

**Invoice Printing**: Built-in formatted invoice generator showing customer shipping details, payment gateway reference, breakdown of variants, and tax/shipping totals.

---

### 4. Marketing & Promotion Modules

#### Flash Sales (`/admin/flash-sale`)
- Define promotional flash sales with end-date countdown clocks.
- Add specific catalog items with custom flash discount prices.
- Toggle **Show at Home** to feature the flash sale on the primary homepage ribbon.

#### Coupons Engine (`/admin/coupons`)
- Create promo codes:
  - Code (e.g. `SUMMER2026`).
  - Discount Type: `Percent (%)` or `Fixed Amount ($)`.
  - Discount Value.
  - Validity window: `start_date` to `end_date`.
  - Quantity & Maximum Use Per Customer limits.

#### Banner Advertising Management (`/admin/advertisement`)
Manage banners across 6 strategic storefront positions:
1. `homepage_banner_section_one`
2. `homepage_banner_section_two`
3. `homepage_banner_section_three`
4. `homepage_banner_section_four`
5. `productpage_banner`
6. `cartpage_banner`

#### Dynamic Homepage Layout Customizer (`/admin/home-page-setting`)
- Configure which categories appear under **Popular Categories**.
- Designate categories for **Product Slider Section 1**, **Section 2**, and **Section 3**.

---

### 5. Payout Methods & Merchant Withdrawals (`/admin/withdraw`)
1. Configure payout channels under `/admin/withdraw-method`:
   - Name (e.g. `Direct Bank Wire`, `PayPal Payout`).
   - Minimum & Maximum withdrawal boundaries.
   - Platform commission / withdrawal charge percentage.
   - Payout instructions shown to merchants.
2. Under `/admin/withdraw`:
   - Review pending merchant requests.
   - Inspect merchant account details and transaction history.
   - Execute transfer via your banking portal, then mark status as `Paid`.

---

### 6. Core System Settings (`/admin/settings`)

| Settings Tab | Configurable Options |
| :--- | :--- |
| **General Settings** | Site Name, Support Email, Phone, Country, Timezone, Currency Code (USD, INR, EUR), Currency Symbol ($) |
| **Email Settings** | SMTP Host, Port, Username, Password, Encryption (TLS/SSL), Sender Email |
| **Pusher Settings** | App ID, Key, Secret, Cluster (Updates real-time chat infrastructure) |
| **Logo & Favicon** | Header Logo, Footer Logo, Browser Favicon |
| **Payment Gateways** | PayPal credentials, Stripe API Keys, Razorpay credentials, COD toggle, Currency Exchange Rates |
| **Footer & CMS** | Footer contact details, Social links, 2 dynamic footer link grids, About Us, Terms & Conditions |
