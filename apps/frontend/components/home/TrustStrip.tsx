import { Gem, RotateCcw, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { sectionWidth } from "./SectionHeading";

const points: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Truck, title: "Free Shipping", text: "above ₹499" },
  { icon: RotateCcw, title: "Easy 7-Day Returns", text: "hassle-free exchange" },
  { icon: Gem, title: "Anti-Tarnish", text: "skin-safe finish" },
  { icon: ShieldCheck, title: "Secure Payments", text: "UPI, Cards, COD" },
];

export function TrustStrip() {
  return (
    <section aria-label="Why shop with us" className="border-b border-sand bg-cream">
      <ul className={cn(sectionWidth, "grid grid-cols-2 gap-6 py-8 lg:grid-cols-4")}>
        {points.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3 lg:justify-center">
            <Icon className="h-7 w-7 shrink-0 text-gold" aria-hidden />
            <div>
              <p className="text-sm font-bold text-ink">{title}</p>
              <p className="text-xs text-ink/60">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
