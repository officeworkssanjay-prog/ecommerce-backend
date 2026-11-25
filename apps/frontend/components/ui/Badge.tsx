import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "gold" | "success" | "danger" | "info";
const tones: Record<Tone, string> = {
  neutral: "bg-sand text-ink",
  gold: "bg-parchment text-gold-dark",
  success: "bg-success/15 text-success",
  danger: "bg-danger/10 text-danger",
  info: "bg-ink/10 text-ink",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>{children}</span>;
}

/** Maps an order status to a badge tone. */
export function orderStatusTone(status: string): Tone {
  if (status === "DELIVERED") return "success";
  if (status === "CANCELED") return "danger";
  if (status === "PENDING") return "gold";
  return "info";
}
