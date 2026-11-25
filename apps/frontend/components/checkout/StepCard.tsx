import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export const CHECKOUT_STEPS = ["Contact", "Address", "Delivery", "Payment"] as const;

/** Horizontal step indicator: completed (check), active (gold dot), future (grey dot). */
export function StepIndicator({ step }: { step: number }) {
  return (
    <ol aria-label="Checkout steps" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium">
      {CHECKOUT_STEPS.map((label, i) => (
        <li key={label} aria-current={i === step ? "step" : undefined} className={cn("flex items-center gap-1.5", i === step ? "text-ink" : i < step ? "text-gold-dark" : "text-ink/50")}>
          {i < step ? <Check className="h-3.5 w-3.5" aria-hidden /> : <span className={cn("h-2 w-2 rounded-full", i === step ? "bg-gold" : "bg-sand")} aria-hidden />}
          {label}
          <span className="sr-only">{i < step ? " (completed)" : i === step ? " (current step)" : ""}</span>
        </li>
      ))}
    </ol>
  );
}

interface Props {
  index: number;
  title: string;
  state: "done" | "active" | "future";
  /** One-line summary shown when the step is complete. */
  summary?: ReactNode;
  /** Helper line shown when the step is still ahead. */
  helper: string;
  onEdit?: () => void;
  children?: ReactNode;
}

/** One accordion card: only the active step is expanded. */
export function StepCard({ index, title, state, summary, helper, onEdit, children }: Props) {
  return (
    <section aria-labelledby={`step-${index}`} className={cn("rounded-md border bg-white p-5 sm:p-6", state === "active" ? "border-gold" : "border-sand")}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold", state === "done" ? "bg-ink text-cream" : state === "active" ? "bg-gold text-ink-deep" : "bg-sand/70 text-ink/60")}
        >
          {state === "done" ? <Check className="h-4 w-4" /> : index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`step-${index}`} className="font-serif text-xl text-ink">
            {title}
          </h2>
          {state === "done" && summary && <div className="mt-1 text-sm text-ink/70">{summary}</div>}
          {state === "future" && <p className="mt-1 text-sm text-ink/60">{helper}</p>}
        </div>
        {state === "done" && onEdit && (
          <button type="button" onClick={onEdit} aria-label={`Edit ${title}`} className="text-sm font-medium text-gold-dark underline-offset-2 hover:underline">
            Edit
          </button>
        )}
      </div>
      {state === "active" && <div className="mt-5">{children}</div>}
    </section>
  );
}
