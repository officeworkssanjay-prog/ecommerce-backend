import Link from "next/link";
import { Star } from "lucide-react";
import { SectionHeading, sectionWidth } from "./SectionHeading";

const testimonials = [
  { name: "Aisha Khan", city: "Mumbai", avatar: "/images/figma/testimonial-1.png", quote: "The quality is exceptional and the designs feel truly heirloom. I wore the Swarnika necklace for my cousin's wedding and received so many compliments." },
  { name: "Priya Nair", city: "Bangalore", avatar: "/images/figma/testimonial-2.png", quote: "The everyday collection is perfect for work. The pieces are light, elegant and affordable without compromising on quality." },
  { name: "Riya Sharma", city: "Delhi", avatar: "/images/figma/testimonial-3.png", quote: "The bridal consultation was seamless. They helped me find the perfect maang tikka to match my lehenga without any pressure." },
];

export function BridalBanner() {
  return (
    <section className="relative flex min-h-[520px] items-center overflow-hidden bg-ink-deep text-white lg:h-[680px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/figma/bridal-banner.png" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-deep/90 via-ink-deep/50 to-transparent" />
      <div className={`${sectionWidth} relative z-10 w-full py-16`}>
        <span className="inline-block rounded-full border border-gold px-4 py-1.5 text-xs font-semibold tracking-wider text-gold">The Bridal Edit</span>
        <h2 className="mt-6 font-serif text-4xl font-bold leading-tight sm:text-6xl">
          Every Ritual,
          <br />
          <span className="text-gold">Beautifully</span>
          <br />
          <span className="text-gold">Adorned</span>
        </h2>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/products?category=bridal-sets" className="rounded-md bg-gold px-8 py-3.5 text-sm font-bold text-ink-deep transition-colors hover:bg-gold-light">
            Explore Bridal
          </Link>
          <Link href="/contact" className="rounded-md border border-white/70 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
            Book a Stylist
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className={sectionWidth}>
        <SectionHeading eyebrow="TESTIMONIALS" title="What they say" centered />
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="flex flex-col rounded-2xl border border-sand p-7">
              <div role="img" aria-label="5 out of 5 stars" className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" aria-hidden />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 font-serif text-base italic leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.avatar} alt={`Photo of ${t.name}`} loading="lazy" className="h-11 w-11 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-bold text-ink">{t.name}</p>
                  <p className="text-xs text-ink/60">{t.city}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

const instagram = ["insta-1", "insta-2", "insta-3", "insta-4"];

export function InstagramStrip() {
  return (
    <section className="bg-cream py-16 sm:py-20">
      <div className={sectionWidth}>
        <SectionHeading eyebrow="#SAWARIYAMOMENTS" title="Follow us" centered />
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {instagram.map((name, i) => (
            <li key={name} className="aspect-square overflow-hidden rounded-2xl bg-parchment">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/images/figma/${name}.png`} alt={`Sawariya Jewels customer moment ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
