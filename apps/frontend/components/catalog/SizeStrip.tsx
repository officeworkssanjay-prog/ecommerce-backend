"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { SizeGuideModal } from "./SizeGuideModal";

export const BANGLE_SIZES = ["2.2", "2.4", "2.6", "2.8"];

interface Props {
  selected: string;
  onSelect: (size: string) => void;
}

/** Cream strip shown on the Bangles category only. Clicking the active size clears it. */
export function SizeStrip({ selected, onSelect }: Props) {
  const [guide, setGuide] = useState(false);
  return (
    <div className="bg-cream">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-3 px-4 py-4 sm:px-6 lg:px-8">
        <p id="size-strip-label" className="text-sm font-semibold text-ink">
          Not sure of your size?
        </p>
        <div role="group" aria-labelledby="size-strip-label" className="flex flex-wrap gap-2">
          {BANGLE_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={selected === s}
              onClick={() => onSelect(selected === s ? "" : s)}
              className={cn(
                "h-9 min-w-12 rounded-full border px-4 text-sm transition-colors",
                selected === s ? "border-gold bg-gold text-ink-deep" : "border-sand bg-white text-ink hover:border-gold"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setGuide(true)} className="text-sm font-medium text-gold-dark underline-offset-4 hover:underline">
          Size Guide ↗
        </button>
      </div>
      <SizeGuideModal open={guide} onClose={() => setGuide(false)} />
    </div>
  );
}
