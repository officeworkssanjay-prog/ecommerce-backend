/** The fixed storefront navigation (matches the design). Slugs map to the seeded categories. */
export interface NavChild {
  label: string;
  href: string;
  slug: string;
}

export interface NavItem {
  key: string;
  label: string;
  href: string;
  /** Category slugs that mark this item as active. */
  slugs?: string[];
  sale?: boolean;
  children?: NavChild[];
}

const cat = (slug: string) => `/products?category=${slug}`;

export const navItems: NavItem[] = [
  { key: "bangles", label: "Bangles", href: cat("bangles"), slugs: ["bangles"] },
  { key: "necklaces", label: "Necklace", href: cat("necklaces"), slugs: ["necklaces"] },
  { key: "earrings", label: "Earrings", href: cat("earrings"), slugs: ["earrings"] },
  { key: "rings", label: "Rings", href: cat("rings"), slugs: ["rings"] },
  { key: "bridal-sets", label: "Bridal", href: cat("bridal-sets"), slugs: ["bridal-sets"] },
  {
    key: "anklets",
    label: "Anklets & Others",
    href: cat("anklets"),
    slugs: ["anklets", "mangalsutras", "bracelets"],
    children: [
      { label: "Anklets", slug: "anklets", href: cat("anklets") },
      { label: "Mangalsutras", slug: "mangalsutras", href: cat("mangalsutras") },
      { label: "Bracelets", slug: "bracelets", href: cat("bracelets") },
    ],
  },
  { key: "sale", label: "Sale", href: "/products?sale=true", sale: true },
];

/** Which nav item matches the current /products query, if any. */
export function activeNavKey(pathname: string, params: { get(name: string): string | null }): string | null {
  if (pathname !== "/products") return null;
  if (params.get("sale") === "true") return "sale";
  const category = params.get("category");
  if (!category) return null;
  return navItems.find((i) => i.slugs?.includes(category))?.key ?? null;
}
