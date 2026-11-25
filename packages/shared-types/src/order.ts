import { z } from "zod";
import { PhoneSchema } from "./auth";

export const OrderStatusEnum = z.enum([
  "PENDING",
  "PROCESSED_AND_READY_TO_SHIP",
  "DROPPED_OFF",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELED",
]);
export type OrderStatusType = z.infer<typeof OrderStatusEnum>;

export const PaymentStatusEnum = z.enum(["UNPAID", "PAID"]);
export type PaymentStatusType = z.infer<typeof PaymentStatusEnum>;

/** Online payments go through Razorpay; everything else is cash on delivery. */
export const PaymentMethodEnum = z.enum(["COD", "RAZORPAY"]);
export type PaymentMethodType = z.infer<typeof PaymentMethodEnum>;

// ---------- Addresses ----------
export const AddressInputSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Invalid email address").max(254),
  phone: PhoneSchema,
  country: z.string().trim().min(2, "Country is required").max(60),
  state: z.string().trim().min(2, "State is required").max(60),
  city: z.string().trim().min(2, "City is required").max(60),
  zipCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/, "Enter a valid postal code"),
  address: z.string().trim().min(5, "Address must be at least 5 characters").max(200),
  addressType: z.enum(["home", "office"]).default("home"),
  isDefault: z.boolean().optional(),
});
export type AddressInput = z.infer<typeof AddressInputSchema>;

export const AddressSnapshotSchema = AddressInputSchema.omit({ isDefault: true });
export type AddressSnapshot = z.infer<typeof AddressSnapshotSchema>;

export const ShippingSnapshotSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.string(),
  cost: z.number(),
});
export type ShippingSnapshot = z.infer<typeof ShippingSnapshotSchema>;

export const CouponSnapshotSchema = z.object({
  code: z.string(),
  name: z.string().optional(),
  discountType: z.enum(["PERCENT", "AMOUNT"]),
  discount: z.number(),
  calculatedDiscount: z.number(),
});
export type CouponSnapshot = z.infer<typeof CouponSnapshotSchema>;

// ---------- Cart / checkout ----------
/** One selected option per variant. Accepts an id or `{ id }` (older cart format). */
const VariantSelectionSchema = z.record(
  z.string(),
  z.union([z.string().uuid("Invalid option"), z.object({ id: z.string().uuid("Invalid option") }).passthrough()])
);

/**
 * A cart line as sent by the client. Only identifiers and quantity are accepted:
 * prices, names and totals are always recalculated on the server, and any such
 * fields in the payload are stripped.
 */
export const CartItemSchema = z.preprocess(
  (value) => {
    if (value && typeof value === "object" && !("productId" in value) && "id" in value) {
      return { ...(value as Record<string, unknown>), productId: (value as { id: unknown }).id };
    }
    return value;
  },
  z.object({
    productId: z.string({ required_error: "Product is required" }).uuid("Invalid product"),
    qty: z.coerce.number({ invalid_type_error: "Quantity must be a number" }).int("Quantity must be a whole number").min(1, "Quantity must be at least 1").max(20, "You can order at most 20 of one item"),
    variants: VariantSelectionSchema.optional(),
  })
);
export type CartItemInput = z.infer<typeof CartItemSchema>;

const couponCode = z.string().trim().min(1).max(40).optional().or(z.literal("").transform(() => undefined));

export const PricingRequestSchema = z.object({
  items: z.array(CartItemSchema).min(1, "Your cart is empty").max(50, "Too many items in the cart"),
  couponCode,
  shippingRuleId: z.string().uuid("Invalid shipping method").optional(),
  /** Optional in a cart preview; checkout always requires it. Drives the COD fee / prepaid discount. */
  paymentMethod: PaymentMethodEnum.optional(),
  giftWrap: z.boolean().optional(),
});
export type PricingRequest = z.infer<typeof PricingRequestSchema>;

export const CheckoutSchema = PricingRequestSchema.extend({
  addressId: z.string({ required_error: "Please select a delivery address" }).uuid("Please select a delivery address"),
  paymentMethod: PaymentMethodEnum,
});
export type CheckoutInput = z.infer<typeof CheckoutSchema>;

export const VerifyPaymentSchema = z.object({
  orderId: z.string().uuid("Invalid order"),
  razorpayOrderId: z.string().trim().min(1).max(100),
  razorpayPaymentId: z.string().trim().min(1).max(100),
  razorpaySignature: z.string().trim().min(1).max(256),
});
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;

export const PincodeParamSchema = z.object({
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode"),
});

export const StockAlertSchema = z.object({
  email: z.string({ required_error: "Email is required" }).trim().toLowerCase().email("Enter a valid email address").max(254),
});

export const OrderIdParamSchema = z.object({ id: z.string().uuid("Invalid order") });

export const TrackOrderParamsSchema = z.object({
  invoiceId: z.coerce.number().int().positive("Invalid invoice number"),
});
export const TrackOrderQuerySchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter the email used for the order"),
});
