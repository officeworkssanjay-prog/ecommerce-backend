import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import type { CheckoutResult } from "@/lib/types";
import { Button, buttonClasses } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Field";
import type { Outcome } from "./useCheckout";

interface Props {
  outcome: Outcome;
  busy: boolean;
  error: string | null;
  onRetry: (order: CheckoutResult) => void;
  onCancel: (order: CheckoutResult) => void;
}

export function Outcomes({ outcome, busy, error, onRetry, onCancel }: Props) {
  if (outcome.kind === "success") {
    // The page redirects to the confirmation screen; this is the fallback while that happens.
    return (
      <div className="mx-auto max-w-lg space-y-5 px-4 py-20 text-center" role="status">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" aria-hidden />
        <h1 className="font-serif text-3xl text-ink">Order placed</h1>
        <p className="text-sm text-ink/70">Taking you to your confirmation…</p>
        <Link href={`/order-confirmation?order=${encodeURIComponent(outcome.orderId)}&invoice=${outcome.invoiceId}`} className={buttonClasses("primary", "md")}>
          View confirmation
        </Link>
      </div>
    );
  }

  if (outcome.kind === "cancelled") {
    return (
      <div className="mx-auto max-w-lg space-y-5 px-4 py-20 text-center" role="status">
        <XCircle className="mx-auto h-14 w-14 text-ink/50" aria-hidden />
        <h1 className="font-serif text-3xl text-ink">Order cancelled</h1>
        <p className="text-sm text-ink/70">Order #{outcome.invoiceId} was cancelled. Your cart is still saved.</p>
        <Link href="/cart" className={buttonClasses("primary", "md")}>
          Back to cart
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-20 text-center">
      <div aria-hidden className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger text-2xl font-bold text-white">
        !
      </div>
      <h1 className="font-serif text-3xl text-ink">Payment didn&apos;t go through</h1>
      <p role="alert" className="text-sm text-ink/70">
        {outcome.reason} Order #{outcome.order.invoiceId} is reserved but unpaid. Your cart is saved.
      </p>
      <FormError message={error} />
      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" loading={busy} onClick={() => onRetry(outcome.order)}>
          Try again
        </Button>
        <Button size="lg" variant="outline" disabled={busy} onClick={() => onCancel(outcome.order)}>
          Cancel order
        </Button>
      </div>
    </div>
  );
}
