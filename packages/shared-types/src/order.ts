import { z } from "zod";

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

export const AddressSnapshotSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  country: z.string(),
  state: z.string(),
  city: z.string(),
  zipCode: z.string(),
  address: z.string(),
  addressType: z.string().default("home"),
});
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

export const CartItemVariantSelectionSchema = z.record(
  z.string(), // e.g. "Size"
  z.object({
    id: z.string(),
    name: z.string(), // e.g. "XL"
    price: z.number(), // extra modifier
  })
);
export type CartItemVariantSelection = z.infer<typeof CartItemVariantSelectionSchema>;

export const CreateOrderSchema = z.object({
  addressId: z.string().uuid(),
  shippingRuleId: z.string().uuid(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["STRIPE", "PAYPAL", "RAZORPAY", "COD"]),
  stripeToken: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
});
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
