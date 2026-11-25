"use client";

import { Banknote, CreditCard } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

export type PaymentChoice = "COD" | "RAZORPAY";

interface Props {
  online: boolean;
  value: PaymentChoice;
  onChange: (v: PaymentChoice) => void;
  onPlace: () => void;
  placing: boolean;
  total: number;
  disabled?: boolean;
  /** COD cannot be used for the chosen address's pincode. */
  codBlocked?: boolean;
  /** Amounts from the server's own pricing; zero means nothing to say. */
  hints: { prepaidDiscount: number; codFee: number; giftWrapFee: number };
  giftWrap: boolean;
  onGiftWrap: (v: boolean) => void;
}

export function PaymentStep({ online, value, onChange, onPlace, placing, total, disabled, codBlocked, hints, giftWrap, onGiftWrap }: Props) {
  const method = online ? value : "COD";
  const option = (id: PaymentChoice, title: string, text: string, icon: React.ReactNode, hint?: string, off?: boolean) => (
    <label
      className={cn(
        "flex items-start gap-3 rounded-md border p-4 text-sm focus-within:outline-2 focus-within:outline-gold",
        off ? "cursor-not-allowed border-sand bg-white opacity-60" : "cursor-pointer",
        !off && (method === id ? "border-gold bg-parchment" : "border-sand bg-white hover:bg-parchment/50")
      )}
    >
      <input type="radio" name="payment" disabled={off} checked={method === id} onChange={() => onChange(id)} className="mt-1 accent-gold" />
      <span className="text-gold-dark">{icon}</span>
      <span>
        <span className="block font-semibold text-ink">{title}</span>
        <span className="text-xs text-ink/60">{text}</span>
        {hint && <span className={cn("mt-0.5 block text-xs font-medium", off ? "text-danger" : "text-success")}>{hint}</span>}
      </span>
    </label>
  );
  const prepaidHint = hints.prepaidDiscount > 0 ? `Save ${formatPrice(hints.prepaidDiscount)} on online payment` : undefined;
  const codHint = codBlocked ? "Cash on delivery is not available for this pincode" : hints.codFee > 0 ? `COD fee ${formatPrice(hints.codFee)}` : undefined;
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink/70">Choose a secure payment method.</p>
      <fieldset className="space-y-3">
        <legend className="sr-only">Payment method</legend>
        {online && option("RAZORPAY", "UPI, Cards & Netbanking (via Razorpay)", "You will complete the payment in the secure Razorpay window.", <CreditCard className="h-5 w-5" aria-hidden />, prepaidHint)}
        {option("COD", "Cash on delivery", "Pay when your order arrives.", <Banknote className="h-5 w-5" aria-hidden />, codHint, codBlocked)}
      </fieldset>
      {!online && <p className="text-xs text-ink/60">Online payment is not available right now.</p>}
      {(hints.giftWrapFee > 0 || giftWrap) && (
        <Checkbox label={hints.giftWrapFee > 0 ? `Add gift wrap (+${formatPrice(hints.giftWrapFee)})` : "Add gift wrap"} checked={giftWrap} onChange={(e) => onGiftWrap(e.target.checked)} />
      )}
      <Button size="lg" className="w-full" loading={placing} disabled={disabled} onClick={onPlace}>
        {method === "RAZORPAY" ? `Pay ${formatPrice(total)}` : `Place order · ${formatPrice(total)}`}
      </Button>
      <p className="text-xs text-ink/60">By placing your order, you agree to our Terms &amp; Conditions. Online payments are securely encrypted.</p>
    </div>
  );
}
