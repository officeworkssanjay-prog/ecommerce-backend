import Link from "next/link";
import { cn } from "@/lib/cn";
import { sectionWidth } from "./SectionHeading";

export const brandStory = {
  image: "/images/figma/brand-story.png",
  eyebrow: "OUR STORY",
  heading: "Heirloom Craft, Everyday Price",
  text: "Sawariya Jewels brings together master artisans and modern design to make luxury accessible to every woman. We believe in timeless pieces that feel like family heirlooms, without the heavy price tag.",
  stats: [
    { value: "2L+", label: "Happy Customers" },
    { value: "3,000+", label: "Designs" },
    { value: "4.8★", label: "Rating" },
  ],
};

/** Photo + story + stats. `cta` adds the "Our Story" button (home page); the About page omits it. */
export function BrandStory({ cta = true, headingLevel: H = "h2" }: { cta?: boolean; headingLevel?: "h1" | "h2" }) {
  return (
    <section className="bg-cream py-16 sm:py-20">
      <div className={cn(sectionWidth, "grid items-center gap-10 lg:grid-cols-2 lg:gap-16")}>
        <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-parchment">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brandStory.image} alt="Artisans crafting Sawariya Jewels jewellery" loading="lazy" className="h-full w-full object-cover" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-gold">{brandStory.eyebrow}</span>
          <H className="mt-2 font-serif text-3xl font-bold text-ink sm:text-4xl">{brandStory.heading}</H>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink/70 sm:text-base">{brandStory.text}</p>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            {brandStory.stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="text-xs text-ink/60">{s.label}</dt>
                <dd className="font-serif text-3xl font-bold text-gold">{s.value}</dd>
              </div>
            ))}
          </dl>
          {cta && (
            <Link href="/about" className="mt-8 inline-block rounded-md border border-gold px-8 py-3 text-sm font-semibold text-gold-dark transition-colors hover:bg-parchment">
              Our Story
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
