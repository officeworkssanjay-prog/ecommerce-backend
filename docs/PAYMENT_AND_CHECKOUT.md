# Checkout and payments

## Principles

1. **The client sends choices, never prices.** A cart line is `{ productId, qty, variants? }`. Anything else in the payload (price, name, totals) is stripped by the schema.
2. **The server prices everything** from the database (`apps/backend/src/services/pricing.service.ts`), in integer cents:
   - unit price = `offerPrice` while the offer window is open, else `price`
   - + the chosen option for each variant group (the default option when none is chosen; invalid or foreign options are rejected)
   - × quantity (1-20, and not more than stock)
3. **Coupons** are validated on the server (active, within dates, quantity left, per-user `maxUse`). The cart preview reports a bad coupon in `couponError` without failing; checkout rejects it with `400`.
4. **Shipping**: the chosen active rule, or the cheapest eligible one. A `min_cost` rule applies only when the (discounted) subtotal reaches `minCost`.
5. **Stock and coupon use are reserved in one transaction** with guarded updates (`WHERE qty >= n`, `WHERE totalUsed < quantity`), so concurrent buyers cannot oversell. Cancelling restocks and returns the coupon use.

## Endpoints

| Method & path | Auth | Purpose |
|---|---|---|
| `POST /api/order/calculate-pricing` | public | Preview: `{ items, couponCode?, shippingRuleId?, paymentMethod?, giftWrap? }` → priced lines, `subTotal`, `discount`, `shippingCost`, `prepaidDiscount`, `codFee`, `giftWrapFee`, `finalPayable`, `couponError`, `onlinePaymentAvailable` |
| `POST /api/order/checkout` | buyer | `{ items, addressId, paymentMethod: "COD" \| "RAZORPAY", couponCode?, shippingRuleId?, giftWrap? }` → `{ orderId, invoiceId, paymentMethod, gateway }` |
| `POST /api/order/payment/verify` | buyer | `{ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }` → marks the order PAID |
| `POST /api/order/:id/cancel` | buyer | Cancel an own order that is still `PENDING` and unpaid |
| `GET /api/order/user/orders` | buyer | Order history |
| `GET /api/order/track/:invoiceId?email=` | public | Guest tracking; needs the invoice number **and** the order email |

Delivery addresses must be saved first (`POST /api/user/addresses`); there is no invented fallback address.

## Cash on delivery

`paymentMethod: "COD"` creates the order `PENDING` / `UNPAID` with a ledger row `COD-<invoice>`. The admin moves it through fulfilment; marking it `DELIVERED` also marks it paid (cash collected).

## Razorpay

Configure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (server environment only). Without them online payment is reported unavailable and COD still works.

1. `POST /order/checkout` with `RAZORPAY` creates the order and a Razorpay order; the response contains `gateway: { keyId, orderId, amount, currency }`.
2. The browser opens Razorpay Checkout with those values.
3. On success the browser calls `POST /order/payment/verify`. The server checks `HMAC-SHA256(razorpayOrderId + "|" + razorpayPaymentId, secret)` against the signature (constant-time) and the stored `gatewayOrderId`; only then is the order marked `PAID` and a `Transaction` created. The call is idempotent.
4. If the buyer abandons the payment the order stays `PENDING`/`UNPAID` with stock reserved; the buyer (or admin) can cancel it, which restocks.

Currency: the amount sent to Razorpay is the order total × `RazorpaySetting.currencyRate` in `RazorpaySetting.currencyName` (rate 1 when it equals the store currency). Configure these in **Admin → Settings → Payments**.

## Order status rules

`PENDING → PROCESSED_AND_READY_TO_SHIP → DROPPED_OFF → SHIPPED → OUT_FOR_DELIVERY → DELIVERED`; `CANCELED` is allowed from `PENDING`, `PROCESSED_AND_READY_TO_SHIP` and `DROPPED_OFF`. `DELIVERED` and `CANCELED` are final. Online payments cannot be marked paid by hand. Source of truth: `apps/backend/src/services/order-status.ts`.

## Fees, prepaid discount and delivery areas

Set by the store owner in Admin → Settings (General), stored in `GeneralSetting`, and applied by the server only:

- `prepaidDiscountPercent`: percentage taken off the order (after coupon) when paying online (Razorpay).
- `codFee`: flat fee added to cash-on-delivery orders.
- `giftWrapFee`: price of the optional gift wrap (`giftWrap: true`).

Order total = subtotal − coupon + shipping + COD fee + gift wrap − prepaid discount. Each amount is saved on the order (`prepaidDiscount`, `codFee`, `giftWrap`, `giftWrapFee`).

Delivery areas: Admin → Pincodes lists the pincodes you deliver to, each with delivery days and whether COD is available. While the list is empty delivery is not restricted; once it has entries, checkout rejects other pincodes and rejects COD where it is switched off. `GET /api/storefront/pincode/:pincode` powers the storefront check.

"Notify me" requests for sold-out products are stored (Admin → Stock alerts). No email is sent yet because no mail transport is configured.
