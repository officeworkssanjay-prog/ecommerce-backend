"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { Modal } from "./Modal";

type ToastKind = "success" | "error" | "info";
interface Toast { id: number; kind: ToastKind; message: string }

interface ConfirmOptions { title: string; message?: string; confirmLabel?: string; danger?: boolean }

interface FeedbackApi {
  toast: { success: (m: string) => void; error: (m: string) => void; info: (m: string) => void };
  /** Resolves true when the user confirms. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackApi | null>(null);

const icons = { success: CheckCircle2, error: XCircle, info: Info };
const tones: Record<ToastKind, string> = {
  success: "border-success/40 text-success",
  error: "border-danger/40 text-danger",
  info: "border-gold/60 text-gold-dark",
};

/** Mount once in the root layout. Gives every page `useFeedback()` for toasts and confirm dialogs. */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const counter = useRef(0);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = ++counter.current;
    setToasts((t) => [...t.slice(-3), { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 7000 : 4000);
  }, []);

  const api = useMemo<FeedbackApi>(
    () => ({
      toast: { success: (m) => push("success", m), error: (m) => push("error", m), info: (m) => push("info", m) },
      confirm: (options) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    }),
    [push]
  );

  const settle = (value: boolean) => {
    pending?.resolve(value);
    setPending(null);
  };

  return (
    <FeedbackContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[110] flex w-[min(92vw,22rem)] flex-col gap-2">
        {toasts.map((t) => {
          const Icon = icons[t.kind];
          return (
            <div key={t.id} role={t.kind === "error" ? "alert" : "status"} className={cn("pointer-events-auto flex items-start gap-3 rounded-lg border bg-white px-4 py-3 text-sm shadow-card", tones[t.kind])}>
              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span className="text-ink">{t.message}</span>
            </div>
          );
        })}
      </div>
      <Modal
        open={!!pending}
        onClose={() => settle(false)}
        title={pending?.title ?? ""}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => settle(false)}>
              Cancel
            </Button>
            <Button variant={pending?.danger ? "danger" : "primary"} onClick={() => settle(true)}>
              {pending?.confirmLabel ?? "Confirm"}
            </Button>
          </>
        }
      >
        {pending?.message && <p className="text-sm text-ink/70">{pending.message}</p>}
      </Modal>
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): FeedbackApi {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback must be used within FeedbackProvider");
  return ctx;
}
