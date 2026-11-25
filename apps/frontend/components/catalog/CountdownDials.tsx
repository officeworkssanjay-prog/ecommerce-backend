import type { Countdown } from "./useCountdown";
import { cn } from "@/lib/cn";

const pad = (n: number) => String(n).padStart(2, "0");

/** Hours : Mins : Secs tiles. `size="lg"` is the flash-sale page variant. */
export function CountdownDials({ time, size = "md" }: { time: Countdown; size?: "md" | "lg" }) {
  const tile = cn(
    "flex flex-col items-center justify-center rounded-2xl border border-gold/30 bg-ink-soft shadow-inner",
    size === "lg" ? "h-16 w-16" : "h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20"
  );
  const units: [number, string][] = [
    [time.hours, "Hours"],
    [time.minutes, "Mins"],
    [time.seconds, "Secs"],
  ];
  return (
    <div role="timer" aria-label="Time remaining" className="flex items-center gap-3 sm:gap-5">
      {units.map(([value, label], i) => (
        <div key={label} className="flex items-center gap-3 sm:gap-5">
          {i > 0 && (
            <span aria-hidden className="text-2xl font-bold text-gold">
              :
            </span>
          )}
          <div className={tile}>
            <span className="font-mono text-2xl font-bold text-parchment sm:text-3xl">{time.ready ? pad(value) : "--"}</span>
            <span className="text-[10px] uppercase tracking-wider text-white/60">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
