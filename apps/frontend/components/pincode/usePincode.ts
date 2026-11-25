"use client";

import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import type { PincodeCheck } from "@/lib/types";

export type PincodeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; result: PincodeCheck };

export const PINCODE_RE = /^[1-9][0-9]{5}$/;

export async function fetchPincode(pin: string): Promise<PincodeCheck> {
  return (await api.get<PincodeCheck>(`/storefront/pincode/${pin}`)).data;
}

/** Looks up a pincode as soon as it is a complete 6-digit value. Idle for anything else. */
export function usePincode(raw: string | undefined): PincodeState {
  const pin = (raw ?? "").trim();
  const valid = PINCODE_RE.test(pin);
  const [state, setState] = useState<{ pin: string; value: PincodeState }>({ pin: "", value: { status: "idle" } });

  useEffect(() => {
    if (!valid) return;
    let live = true;
    fetchPincode(pin)
      .then((result) => {
        if (live) setState({ pin, value: { status: "done", result } });
      })
      .catch((err) => {
        if (live) setState({ pin, value: { status: "error", message: errorMessage(err) } });
      });
    return () => {
      live = false;
    };
  }, [pin, valid]);

  if (!valid) return { status: "idle" };
  return state.pin === pin ? state.value : { status: "loading" };
}
