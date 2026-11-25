"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Slider } from "@/lib/types";
import { cn } from "@/lib/cn";
import { sectionWidth } from "./SectionHeading";

const arrowBtn =
  "absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-ink-deep shadow-lg transition-colors hover:bg-gold-light sm:h-12 sm:w-12";

/** Hero banner driven by the admin-managed sliders. Autoplay pauses on hover/focus and is off for reduced-motion users. */
export function HeroCarousel({ sliders }: { sliders: Slider[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const count = sliders.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (count < 2 || paused || reduced) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(timer);
  }, [count, paused, reduced]);

  if (count === 0) return null;
  const at = Math.min(index, count - 1);
  const current = sliders[at];
  const pad = (n: number) => String(n).padStart(2, "0");
  const go = (next: number) => setIndex((next + count) % count);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative flex min-h-[560px] items-center overflow-hidden bg-ink-deep text-white sm:min-h-[680px] lg:h-[760px]"
    >
      <div className="absolute inset-0" aria-hidden>
        {sliders.map((slide, i) => (
          <div key={slide.id} className={cn("absolute inset-0 transition-opacity duration-700", i === at ? "opacity-100" : "opacity-0")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.banner} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-deep via-ink-deep/70 to-ink-deep/10" />
      </div>

      <div className={cn("relative z-10 w-full px-14 py-20 sm:px-20", sectionWidth)}>
        <div className="max-w-2xl space-y-6" aria-live={paused ? "polite" : "off"}>
          {current.type && <span className="inline-block rounded-full border border-gold px-4 py-1.5 text-xs font-semibold tracking-wider text-gold">{current.type}</span>}
          {current.title && <h1 className="whitespace-pre-line font-serif text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-[64px]">{current.title}</h1>}
          {current.subtitle && <p className="max-w-xl text-base text-white/80 sm:text-lg">{current.subtitle}</p>}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href={current.btnUrl || "/products"} className="rounded-md bg-gold px-8 py-3.5 text-sm font-bold text-ink-deep transition-colors hover:bg-gold-light">
              Shop Now
            </Link>
            <Link href="/products" className="rounded-md border border-white/70 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              View Collection
            </Link>
          </div>
        </div>
      </div>

      {count > 1 && (
        <>
          <button type="button" aria-label="Previous slide" onClick={() => go(at - 1)} className={cn(arrowBtn, "left-3 sm:left-6")}>
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button type="button" aria-label="Next slide" onClick={() => go(at + 1)} className={cn(arrowBtn, "right-3 sm:right-6")}>
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
          <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-between px-6 sm:px-12">
            <div className="flex items-center gap-2">
              {sliders.map((slide, i) => (
                <button key={slide.id} type="button" aria-label={`Go to slide ${i + 1}`} aria-current={i === at} onClick={() => go(i)} className={cn("h-1 rounded-full transition-all", i === at ? "w-10 bg-gold" : "w-5 bg-white/30 hover:bg-white/60")} />
              ))}
            </div>
            <span className="font-sans text-sm tracking-widest text-white/90" aria-hidden>
              {pad(at + 1)} / {pad(count)}
            </span>
          </div>
        </>
      )}
    </section>
  );
}
