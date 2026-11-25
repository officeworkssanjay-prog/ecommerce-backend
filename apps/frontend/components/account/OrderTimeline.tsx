import { Check, XCircle } from "lucide-react";
import type { OrderStatus } from "@/lib/types";
import { formatDateTime, humanize } from "@/lib/format";
import { cn } from "@/lib/cn";

export const ORDER_STEPS: OrderStatus[] = ["PENDING", "PROCESSED_AND_READY_TO_SHIP", "DROPPED_OFF", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

const STEP_COPY: Record<string, { title: string; note: string }> = {
  PENDING: { title: "Order confirmed", note: "We've received your order." },
  PROCESSED_AND_READY_TO_SHIP: { title: "Packed with care", note: "Your jewellery is ready for its journey." },
  DROPPED_OFF: { title: "Handed to courier", note: "Your parcel has left us." },
  SHIPPED: { title: "Shipped", note: "On its way to you." },
  OUT_FOR_DELIVERY: { title: "Out for delivery", note: "Your courier will contact you." },
  DELIVERED: { title: "Delivered", note: "A little sparkle, at your doorstep." },
};

interface Props {
  status: OrderStatus;
  /** "vertical" is the detailed track-order layout; the default is the compact row. */
  layout?: "horizontal" | "vertical";
  /** When the status last changed; shown on the current step only (the API has no per-step dates). */
  updatedAt?: string;
}

export function OrderTimeline({ status, layout = "horizontal", updatedAt }: Props) {
  if (status === "CANCELED") {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
        <XCircle className="h-5 w-5" aria-hidden /> This order was cancelled.
      </p>
    );
  }
  const current = ORDER_STEPS.indexOf(status);
  if (layout === "vertical") {
    return (
      <ol aria-label="Order progress">
        {ORDER_STEPS.map((step, i) => {
          const done = i <= current;
          const isCurrent = i === current;
          return (
            <li key={step} aria-current={isCurrent ? "step" : undefined} className="relative flex gap-4 pb-7 last:pb-0">
              {i < ORDER_STEPS.length - 1 && <span aria-hidden className={cn("absolute left-[11px] top-6 h-[calc(100%-1.5rem)] w-px", i < current ? "bg-gold" : "bg-sand")} />}
              <span className={cn("relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full", done ? "bg-gold text-ink-deep" : "border border-sand bg-white", isCurrent && "ring-4 ring-gold/25")}>
                {done && <Check className="h-3.5 w-3.5" aria-hidden />}
              </span>
              <div className={done ? "" : "opacity-50"}>
                <p className={cn("text-sm text-ink", isCurrent ? "font-bold" : "font-semibold")}>
                  {STEP_COPY[step].title}
                  {isCurrent && <span className="sr-only"> (current step)</span>}
                </p>
                {isCurrent && updatedAt && <p className="text-xs text-gold-dark">Updated {formatDateTime(updatedAt)}</p>}
                <p className="text-xs text-ink/60">{STEP_COPY[step].note}</p>
              </div>
            </li>
          );
        })}
      </ol>
    );
  }
  return (
    <ol aria-label="Order progress" className="grid gap-3 sm:grid-cols-6">
      {ORDER_STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} aria-current={i === current ? "step" : undefined} className="flex items-center gap-2 sm:flex-col sm:text-center">
            <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold", done ? "bg-gold text-ink-deep" : "bg-sand/70 text-ink/50")}>
              {done ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
            </span>
            <span className={cn("text-xs", done ? "font-semibold text-ink" : "text-ink/50")}>{humanize(step)}</span>
          </li>
        );
      })}
    </ol>
  );
}
