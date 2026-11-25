import { Minus, Plus } from "lucide-react";

export const MIN_QTY = 1;
export const MAX_QTY = 20;

interface Props {
  qty: number;
  name: string;
  onChange: (qty: number) => void;
  size?: "sm" | "md";
}

export function QuantityStepper({ qty, name, onChange, size = "md" }: Props) {
  const pad = size === "sm" ? "p-1" : "px-2.5 py-1.5";
  return (
    <div role="group" aria-label={`Quantity for ${name}`} className="flex items-center overflow-hidden rounded-md border border-sand bg-white">
      <button
        type="button"
        onClick={() => onChange(qty - 1)}
        disabled={qty <= MIN_QTY}
        aria-label={`Decrease quantity of ${name}`}
        className={`${pad} text-ink hover:bg-parchment disabled:opacity-40`}
      >
        <Minus className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span className="min-w-8 px-2 text-center text-xs font-bold text-ink" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onChange(qty + 1)}
        disabled={qty >= MAX_QTY}
        aria-label={`Increase quantity of ${name}`}
        className={`${pad} text-ink hover:bg-parchment disabled:opacity-40`}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}
