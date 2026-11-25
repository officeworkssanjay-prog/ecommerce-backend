import crypto from "crypto";
import Razorpay from "razorpay";
import { env } from "../config/env";
import { AppError } from "../utils/errors";

let client: Razorpay | null = null;

function getClient(): Razorpay {
  if (!env.razorpayEnabled) {
    throw new AppError(503, "Online payment is not available right now. Please choose cash on delivery.");
  }
  client ||= new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
  return client;
}

/** Creates the gateway-side order. `amountMinor` is in the smallest unit of `currency` (paise for INR). */
export async function createGatewayOrder(params: { amountMinor: number; currency: string; receipt: string }) {
  try {
    const order = await getClient().orders.create({
      amount: params.amountMinor,
      currency: params.currency,
      receipt: params.receipt,
    });
    return { id: order.id as string, keyId: env.RAZORPAY_KEY_ID };
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error("Razorpay order creation failed:", err);
    throw new AppError(502, "Could not start the online payment. Please try again or choose cash on delivery.");
  }
}

/** Verifies the checkout signature: HMAC-SHA256 of `orderId|paymentId` with the key secret. */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!env.razorpayEnabled) return false;
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
