export interface CategoryContent {
  eyebrow: string;
  title: string;
  tagline: string;
  /** Fallback banner image when the category has no `icon`. */
  image: string;
}

const IMG = "/images/figma/";

// Bangles copy is from the Figma; every other entry is a working copy.
const BY_SLUG: Record<string, CategoryContent> = {
  bangles: { eyebrow: "BANGLES", title: "Bangles & Kadas", tagline: "From everyday stacks to festive kadas.", image: `${IMG}cat-bangles.png` },
  // TODO(figma): confirm copy
  necklaces: { eyebrow: "NECKLACES", title: "Necklaces & Chokers", tagline: "Layers, chokers and statement pieces.", image: `${IMG}cat-necklaces.png` },
  // TODO(figma): confirm copy
  earrings: { eyebrow: "EARRINGS", title: "Earrings", tagline: "Jhumkas, studs and chandbalis for every mood.", image: `${IMG}cat-earrings.png` },
  // TODO(figma): confirm copy
  rings: { eyebrow: "RINGS", title: "Rings", tagline: "Bands, statement and adjustable styles.", image: `${IMG}cat-rings.png` },
  // TODO(figma): confirm copy
  "bridal-sets": { eyebrow: "BRIDAL", title: "Bridal Sets", tagline: "Heirloom pieces for the big day.", image: `${IMG}cat-bridal.png` },
  // TODO(figma): confirm copy
  anklets: { eyebrow: "ANKLETS & OTHERS", title: "Anklets", tagline: "Payal and everyday anklets.", image: `${IMG}cat-anklets.png` },
  // TODO(figma): confirm copy
  mangalsutras: { eyebrow: "MANGALSUTRAS", title: "Mangalsutras", tagline: "Traditional and modern designs.", image: `${IMG}cat-necklaces.png` },
  // TODO(figma): confirm copy
  bracelets: { eyebrow: "BRACELETS", title: "Bracelets", tagline: "Chains, cuffs and charms.", image: `${IMG}cat-chains.png` },
};

// TODO(figma): confirm copy
const SALE: CategoryContent = { eyebrow: "SALE", title: "Sale", tagline: "Limited period offers on select designs.", image: `${IMG}hero.png` };
// TODO(figma): confirm copy
const ALL: CategoryContent = { eyebrow: "ALL JEWELLERY", title: "Shop Jewellery", tagline: "Everything from everyday pieces to bridal sets.", image: `${IMG}hero.png` };

export function getCategoryContent(opts: { category: string; categoryName?: string; sale: boolean; search: string }): CategoryContent {
  if (opts.search) return { eyebrow: "SEARCH", title: `Results for “${opts.search}”`, tagline: "", image: ALL.image };
  if (opts.category) {
    const known = BY_SLUG[opts.category];
    if (known) return known;
    const name = opts.categoryName ?? opts.category;
    return { eyebrow: name.toUpperCase(), title: name, tagline: "", image: ALL.image };
  }
  return opts.sale ? SALE : ALL;
}
