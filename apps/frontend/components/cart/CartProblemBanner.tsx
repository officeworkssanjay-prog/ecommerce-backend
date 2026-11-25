import { AlertTriangle } from "lucide-react";
import type { CartItem } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";

interface Props {
  message: string | null;
  cartProblem: boolean;
  items: CartItem[];
  onRemove: (id: string) => void;
  onRetry: () => void;
}

/** Spec "unavailable item" (server rejected the cart) and "network error" (retry) states. */
export function CartProblemBanner({ message, cartProblem, items, onRemove, onRetry }: Props) {
  return (
    <div role="alert" className="space-y-3 rounded-md border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
      <p className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        {cartProblem ? message : `Something went wrong. Check your connection and try again.${message ? ` (${message})` : ""}`}
      </p>
      {cartProblem ? (
        <div className="space-y-2 text-ink">
          <p className="text-xs">This item may no longer be available. Remove it, or lower its quantity:</p>
          <ul className="space-y-1">
            {items.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate">{i.name}</span>
                <Button size="sm" variant="outline" onClick={() => onRemove(i.id)} aria-label={`Remove ${i.name}`}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
