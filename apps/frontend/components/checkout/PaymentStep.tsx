"use client";

import { Banknote, CreditCard } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/Button";
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
}

export function PaymentStep({ online, value, onChange, onPlace, placing, total, disabled }: Props) {
  const method = online ? value : "COD";
  const option = (id: PaymentChoice, title: string, text: string, icon: React.ReactNode) => (
    <label className={cn("flex cursor-pointer items-start gap-3 rounded-md border p-4 text-sm focus-within:outline-2 focus-within:outline-gold", method === id ? "border-gold bg-parchment" : "border-sand bg-white hover:bg-parchment/50")}>
      <input type="radio" name="payment" checked={method === id} onChange={() => onChange(id)} className="mt-1 accent-gold" />
      <span className="text-gold-dark">{icon}</span>
      <span>
        <span className="block font-semibold text-ink">{title}</span>
        <span className="text-xs text-ink/60">{text}</span>
      </span>
    </label>
  );
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink/70">Choose a secure payment method.</p>
      <fieldset className="space-y-3">
        <legend className="sr-only">Payment method</legend>
        {online && option("RAZORPAY", "UPI, Cards & Netbanking (via Razorpay)", "You will complete the payment in the secure Razorpay window.", <CreditCard className="h-5 w-5" aria-hidden />)}
        {option("COD", "Cash on delivery", "Pay when your order arrives.", <Banknote className="h-5 w-5" aria-hidden />)}
      </fieldset>
      {!online && <p className="text-xs text-ink/60">Online payment is not available right now.</p>}
      <Button size="lg" className="w-full" loading={placing} disabled={disabled} onClick={onPlace}>
        {method === "RAZORPAY" ? `Pay ${formatPrice(total)}` : `Place order · ${formatPrice(total)}`}
      </Button>
      <p className="text-xs text-ink/60">By placing your order, you agree to our Terms &amp; Conditions. Online payments are securely encrypted.</p>
    </div>
  );
}
