"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { errorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { PincodeNote } from "@/components/pincode/PincodeNote";
import { PINCODE_RE, fetchPincode } from "@/components/pincode/usePincode";
import type { PincodeState } from "@/components/pincode/usePincode";

/** Product-page delivery check. Makes no delivery claim unless the store has configured pincodes. */
export function PincodeCheck() {
  const [pin, setPin] = useState("");
  const [state, setState] = useState<PincodeState>({ status: "idle" });
  const [invalid, setInvalid] = useState(false);

  const check = async () => {
    const value = pin.trim();
    if (!PINCODE_RE.test(value)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setState({ status: "loading" });
    try {
      setState({ status: "done", result: await fetchPincode(value) });
    } catch (err) {
      setState({ status: "error", message: errorMessage(err) });
    }
  };

  const unconfigured = state.status === "done" && !state.result.configured;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void check();
      }}
      className="space-y-2"
    >
      <label htmlFor="pdp-pincode" className="flex items-center gap-1.5 text-sm font-medium text-ink">
        <MapPin className="h-4 w-4" aria-hidden /> Check delivery
      </label>
      <div className="flex gap-2">
        <input
          id="pdp-pincode"
          inputMode="numeric"
          maxLength={6}
          autoComplete="postal-code"
          placeholder="Enter 6-digit pincode"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          aria-invalid={invalid || undefined}
          className="w-full border border-sand bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <Button type="submit" variant="outline" loading={state.status === "loading"}>
          Check
        </Button>
      </div>
      {invalid && <p className="text-xs text-danger">Enter a valid 6-digit pincode.</p>}
      {unconfigured ? <p className="text-xs text-ink/60">Delivery check is not available yet.</p> : <PincodeNote state={state} />}
    </form>
  );
}
