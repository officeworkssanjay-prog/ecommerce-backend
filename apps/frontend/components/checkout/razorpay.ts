/** Minimal typing + on-demand loader for Razorpay Checkout. */
export interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailure {
  error?: { description?: string };
}

interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", cb: (response: RazorpayFailure) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let loading: Promise<void> | null = null;

export function loadRazorpay(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Payment is only available in the browser"));
  if (window.Razorpay) return Promise.resolve();
  if (!loading) {
    loading = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        loading = null;
        script.remove();
        reject(new Error("Could not load the payment window. Check your connection and try again."));
      };
      document.body.appendChild(script);
    });
  }
  return loading;
}

export interface OpenOptions {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  prefill?: RazorpayOptions["prefill"];
  onSuccess: (response: RazorpaySuccess) => void;
  onDismiss: () => void;
  onFailed: (reason: string) => void;
}

export async function openRazorpay(o: OpenOptions) {
  await loadRazorpay();
  if (!window.Razorpay) throw new Error("The payment window is unavailable. Please try again.");
  const instance = new window.Razorpay({
    key: o.keyId,
    order_id: o.orderId,
    amount: o.amount,
    currency: o.currency,
    name: "Sawariya Jewels",
    prefill: o.prefill,
    theme: { color: "#caa15e" },
    handler: o.onSuccess,
    modal: { ondismiss: o.onDismiss },
  });
  instance.on("payment.failed", (r) => o.onFailed(r.error?.description || "The payment was declined."));
  instance.open();
}
