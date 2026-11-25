import Link from "next/link";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/cn";
import { SectionHeading, sectionWidth } from "./SectionHeading";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className={sectionWidth}>
        <SectionHeading eyebrow="SHOP BY CATEGORY" title="Shop by Category" linkHref="/products" linkLabel="View all" />
        <ul className={cn("grid grid-cols-4 gap-4 sm:gap-6 lg:grid-cols-8")}>
          {categories.slice(0, 8).map((cat) => (
            <li key={cat.id}>
              <Link href={`/products?category=${encodeURIComponent(cat.slug)}`} className="group flex flex-col items-center text-center">
                <div className="aspect-square w-full max-w-[120px] overflow-hidden rounded-full border border-gold p-1 transition-shadow group-hover:shadow-lg">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-parchment">
                    {cat.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cat.icon} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <span aria-hidden className="font-serif text-2xl font-bold text-gold-dark">
                        {cat.name.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
                <span className="mt-3 text-xs font-medium text-ink transition-colors group-hover:text-gold-dark sm:text-sm">{cat.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
