import { AlertCircle, Truck } from "lucide-react";
import type { PincodeState } from "./usePincode";

/** Result line for a pincode lookup. Shows nothing when the store has no delivery restrictions configured. */
export function PincodeNote({ state }: { state: PincodeState }) {
  if (state.status === "idle") return null;
  if (state.status === "loading") {
    return (
      <p role="status" className="text-xs text-ink/60">
        Checking delivery…
      </p>
    );
  }
  if (state.status === "error") {
    return (
      <p role="status" className="text-xs text-ink/60">
        {state.message}
      </p>
    );
  }
  const r = state.result;
  if (!r.configured) return null;
  if (!r.serviceable) {
    return (
      <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-danger">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden /> We do not deliver to this pincode.
      </p>
    );
  }
  return (
    <p role="status" className="flex items-center gap-1.5 text-xs font-medium text-success">
      <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden /> Delivery in ~{r.deliveryDays} {r.deliveryDays === 1 ? "day" : "days"}
      {r.codAvailable ? "" : " · Cash on delivery is not available here"}
    </p>
  );
}
