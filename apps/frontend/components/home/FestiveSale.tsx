"use client";

import Link from "next/link";
import type { FlashSale } from "@/lib/types";
import { useCountdown } from "@/components/catalog/useCountdown";
import { discountPercent } from "@/components/catalog/pricing";
import { sectionWidth } from "./SectionHeading";
import { cn } from "@/lib/cn";

function Dial({ value, label, ready }: { value: number; label: string; ready: boolean }) {
  return (
    <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border border-gold sm:h-28 sm:w-28">
      <span className="font-serif text-3xl font-bold text-white sm:text-4xl">{ready ? String(value).padStart(2, "0") : "--"}</span>
      <span className="text-[10px] uppercase tracking-wider text-white/60">{label}</span>
    </div>
  );
}

/** Shown only while the API reports an active flash sale flagged for the homepage. */
export function FestiveSale({ flashSale }: { flashSale: FlashSale | null }) {
  const time = useCountdown(flashSale?.endDate);
  if (!flashSale || time.expired) return null;

  const best = Math.max(0, ...flashSale.products.map((p) => discountPercent(p.product)));

  return (
    <section className="bg-ink py-14 text-white sm:py-16">
      <div className={cn(sectionWidth, "flex flex-col items-center justify-between gap-10 md:flex-row")}>
        <div className="text-center md:text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-gold">FESTIVE SALE</span>
          <h2 className="mt-2 font-serif text-3xl font-bold sm:text-5xl">
            {best > 0 ? (
              <>
                Up to <span className="text-danger">{best}% off</span>
              </>
            ) : (
              "Festive Sale"
            )}
          </h2>
          <p className="mt-3 text-sm text-white/70 sm:text-base">Limited period offer on select designs.</p>
          <Link href="/products?sale=true" className="mt-6 inline-block rounded-md bg-gold px-8 py-3.5 text-sm font-bold text-ink-deep transition-colors hover:bg-gold-light">
            Shop the Sale
          </Link>
        </div>
        <div role="timer" aria-label="Time left in the sale" className="flex items-center gap-4 sm:gap-6">
          <Dial value={Math.floor(time.hours / 24)} label="Days" ready={time.ready} />
          <Dial value={time.hours % 24} label="Hours" ready={time.ready} />
          <Dial value={time.minutes} label="Mins" ready={time.ready} />
        </div>
      </div>
    </section>
  );
}
