"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api, errorMessage } from "@/lib/api";
import type { ApiCartItem } from "@/context/CartContext";
import type { CheckoutResult } from "@/lib/types";
import { clearPrefs } from "@/components/cart/prefs";
import { openRazorpay } from "./razorpay";
import type { RazorpaySuccess } from "./razorpay";

export type Outcome =
  | { kind: "success"; orderId: string; invoiceId: number; method: "COD" | "RAZORPAY" }
  | { kind: "unpaid"; order: CheckoutResult; reason: string }
  | { kind: "cancelled"; invoiceId: number };

interface PlaceInput {
  items: ApiCartItem[];
  addressId: string;
  paymentMethod: "COD" | "RAZORPAY";
  couponCode?: string;
  shippingRuleId?: string;
}

interface Options {
  clearCart: () => void;
  prefill?: { name?: string; email?: string };
}

/** Order placement + Razorpay flow. An order is only shown as placed after the API says so. */
export function useCheckout({ clearCart, prefill }: Options) {
  const router = useRouter();
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paying = useRef(false);

  const fail = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.isUnauthorized) {
        router.push("/login?next=/checkout");
        return;
      }
      setError(errorMessage(err));
    },
    [router]
  );

  const finish = useCallback(
    (orderId: string, invoiceId: number, method: "COD" | "RAZORPAY") => {
      clearCart();
      clearPrefs();
      setOutcome({ kind: "success", orderId, invoiceId, method });
      router.replace(`/order-confirmation?order=${encodeURIComponent(orderId)}&invoice=${invoiceId}`);
    },
    [clearCart, router]
  );

  const pay = useCallback(
    async (order: CheckoutResult) => {
      if (!order.gateway || paying.current) return;
      paying.current = true;
      let settled = false;
      setError(null);
      const unpaid = (reason: string) => {
        paying.current = false;
        setOutcome({ kind: "unpaid", order, reason });
      };
      try {
        await openRazorpay({
          keyId: order.gateway.keyId,
          orderId: order.gateway.orderId,
          amount: order.gateway.amount,
          currency: order.gateway.currency,
          prefill,
          onDismiss: () => {
            if (!settled) unpaid("Payment not completed. The payment window was closed.");
          },
          onFailed: (reason) => unpaid(`Payment not completed. ${reason}`),
          onSuccess: async (r: RazorpaySuccess) => {
            settled = true;
            setBusy(true);
            try {
              await api.post("/order/payment/verify", {
                orderId: order.orderId,
                razorpayOrderId: r.razorpay_order_id,
                razorpayPaymentId: r.razorpay_payment_id,
                razorpaySignature: r.razorpay_signature,
              });
              paying.current = false;
              finish(order.orderId, order.invoiceId, "RAZORPAY");
            } catch (err) {
              unpaid(`We could not confirm your payment: ${errorMessage(err)} If money was deducted, contact support with invoice #${order.invoiceId}.`);
            } finally {
              setBusy(false);
            }
          },
        });
      } catch (err) {
        unpaid(errorMessage(err));
      }
    },
    [finish, prefill]
  );

  const place = useCallback(
    async (input: PlaceInput) => {
      setBusy(true);
      setError(null);
      try {
        const res = await api.post<CheckoutResult>("/order/checkout", input);
        const order = res.data;
        if (order.paymentMethod === "RAZORPAY") {
          if (!order.gateway) throw new ApiError(500, "The payment gateway did not respond. Please try again.");
          setBusy(false);
          await pay(order);
        } else {
          finish(order.orderId, order.invoiceId, "COD");
        }
      } catch (err) {
        fail(err);
      } finally {
        setBusy(false);
      }
    },
    [fail, finish, pay]
  );

  const cancelUnpaid = useCallback(
    async (order: CheckoutResult) => {
      setBusy(true);
      setError(null);
      try {
        await api.post(`/order/${order.orderId}/cancel`);
        setOutcome({ kind: "cancelled", invoiceId: order.invoiceId });
      } catch (err) {
        fail(err);
      } finally {
        setBusy(false);
      }
    },
    [fail]
  );

  return { outcome, busy, error, place, retryPayment: pay, cancelUnpaid };
}
