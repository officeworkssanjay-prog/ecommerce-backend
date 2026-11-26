/**
 * Storefront navigation. The order and labels follow the design; which categories appear comes from
 * the live category list, so categories added or disabled in the admin panel show up here.
 */
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

const OTHERS = "anklets";

/**
 * Merges the designed menu with the store's active categories: a disabled or deleted category drops
 * out, and any category without its own designed slot is listed under "Anklets & Others".
 * An empty list (still loading or request failed) keeps the designed menu.
 */
export function buildNav(categories: { name: string; slug: string }[]): NavItem[] {
  if (categories.length === 0) return navItems;
  const live = new Set(categories.map((c) => c.slug));
  const designed = new Set(navItems.flatMap((i) => i.slugs ?? []));

  return navItems.flatMap((item): NavItem[] => {
    if (item.sale) return [item];
    if (item.key !== OTHERS) return live.has(item.key) ? [item] : [];

    const children: NavChild[] = [
      ...(item.children ?? []).filter((c) => live.has(c.slug)),
      ...categories.filter((c) => !designed.has(c.slug)).map((c) => ({ label: c.name, slug: c.slug, href: cat(c.slug) })),
    ];
    if (children.length === 0) return [];
    return [{ ...item, href: children[0].href, slugs: children.map((c) => c.slug), children }];
  });
}

/** Which nav item matches the current /products query, if any. */
export function activeNavKey(items: NavItem[], pathname: string, params: { get(name: string): string | null }): string | null {
  if (pathname !== "/products") return null;
  if (params.get("sale") === "true") return "sale";
  const category = params.get("category");
  if (!category) return null;
  return items.find((i) => i.slugs?.includes(category))?.key ?? null;
}
