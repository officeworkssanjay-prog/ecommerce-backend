import type { SubCategory } from "@/lib/types";
import { cn } from "@/lib/cn";

interface Props {
  subCategories: SubCategory[];
  selected: string;
  image: string;
  onSelect: (slug: string) => void;
}

/** Pill row: "All" + the category's sub-categories, each with a tiny round thumbnail. */
export function SubCategoryChips({ subCategories, selected, image, onSelect }: Props) {
  const items = [{ slug: "", name: "All" }, ...subCategories.map((s) => ({ slug: s.slug, name: s.name }))];
  return (
    <div className="bg-white">
      <ul aria-label="Sub-categories" className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
        {items.map((item) => {
          const active = selected === item.slug;
          return (
            <li key={item.slug || "all"} className="shrink-0">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(item.slug)}
                className={cn(
                  "flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-sm transition-colors",
                  active ? "border-ink bg-ink text-white" : "border-sand bg-white text-ink hover:border-gold"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" className="h-6 w-6 rounded-full bg-parchment object-cover" />
                {item.name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
