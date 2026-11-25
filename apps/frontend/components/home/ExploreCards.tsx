import Link from "next/link";
import { cn } from "@/lib/cn";
import { SectionHeading, sectionWidth } from "./SectionHeading";

interface Card {
  href: string;
  image: string;
  tag: string;
  title: string;
  text: string;
}

function ExploreCard({ card, tall, className }: { card: Card; tall?: boolean; className?: string }) {
  return (
    <article className={cn("group flex flex-col", className)}>
      <Link href={card.href} tabIndex={-1} aria-hidden className={cn("relative block overflow-hidden rounded-2xl bg-parchment", tall ? "min-h-[300px] flex-1" : "aspect-[16/9]")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={card.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-ink-deep">{card.tag}</span>
      </Link>
      <div className="pt-4">
        <h3 className="font-serif text-xl font-bold text-ink sm:text-2xl">{card.title}</h3>
        <p className="mt-1 text-sm text-ink/60">{card.text}</p>
        <Link href={card.href} className="mt-2 inline-block text-sm font-semibold text-gold-dark underline underline-offset-4 hover:text-gold">
          Explore<span className="sr-only"> {card.title}</span>
        </Link>
      </div>
    </article>
  );
}

const curated: Card[] = [
  { href: "/products?category=necklaces", image: "/images/figma/curated-large.png", tag: "Swarnika", title: "Swarnika", text: "Statement necklaces for the modern bride" },
  { href: "/products?category=earrings", image: "/images/figma/curated-top-right.png", tag: "Taara", title: "Taara", text: "Earrings for everyday elegance" },
  { href: "/products?category=bangles", image: "/images/figma/curated-bottom-right.png", tag: "Kangan", title: "Kangan", text: "Stacked bangles for the festive season" },
];

const occasions: Card[] = [
  { href: "/products?maxPrice=1500", image: "/images/figma/occasion-everyday.png", tag: "Everyday", title: "Everyday", text: "Minimal pieces for daily wear" },
  { href: "/products?sale=true", image: "/images/figma/occasion-festive.png", tag: "Party & Festive", title: "Party & Festive", text: "Statement pieces for celebrations" },
  { href: "/products?category=bridal-sets", image: "/images/figma/occasion-bridal.png", tag: "Bridal", title: "Bridal", text: "Heirloom pieces for the big day" },
];

/** New arrivals: one large card and two stacked cards. */
export function CuratedGrid() {
  return (
    <section className="bg-cream py-16 sm:py-20">
      <div className={sectionWidth}>
        <SectionHeading eyebrow="NEW ARRIVALS" title="Curated for you" linkHref="/products?sort=newest" linkLabel="View all" />
        <div className="grid gap-6 lg:grid-cols-2">
          <ExploreCard card={curated[0]} tall />
          <div className="grid gap-6">
            <ExploreCard card={curated[1]} />
            <ExploreCard card={curated[2]} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Occasions() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className={sectionWidth}>
        <SectionHeading eyebrow="SHOP BY OCCASION" title="Find your look" linkHref="/products" linkLabel="View all" />
        <div className="grid gap-6 md:grid-cols-3">
          {occasions.map((o) => (
            <ExploreCard key={o.title} card={o} />
          ))}
        </div>
      </div>
    </section>
  );
}
