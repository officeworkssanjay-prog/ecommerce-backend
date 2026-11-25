import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  linkHref?: string;
  linkLabel?: string;
  /** Centered heading without a link (testimonials, Instagram). */
  centered?: boolean;
}

export function SectionHeading({ eyebrow, title, linkHref, linkLabel, centered }: SectionHeadingProps) {
  const heading = (
    <div>
      <span className="text-[11px] font-bold uppercase tracking-widest text-gold">{eyebrow}</span>
      <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">{title}</h2>
    </div>
  );
  if (centered) return <div className={cn("mx-auto mb-10 max-w-xl text-center")}>{heading}</div>;
  return (
    <div className="mb-10 flex items-end justify-between">
      {heading}
      {linkHref && (
        <Link href={linkHref} className="group flex items-center gap-1 text-xs font-semibold text-gold-dark hover:text-gold sm:text-sm">
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      )}
    </div>
  );
}

export const sectionWidth = "mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8";
