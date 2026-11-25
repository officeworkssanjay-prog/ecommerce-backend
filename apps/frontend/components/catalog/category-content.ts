export interface CategoryContent {
  eyebrow: string;
  title: string;
  tagline: string;
  /** Fallback banner image when the category has no `icon`. */
  image: string;
}

const IMG = "/images/figma/";

// Bangles, necklaces, earrings, rings, bridal, anklets and sale copy is from the Figma.
// mangalsutras / bracelets / ALL have no Figma page (mangalsutras is only a chip under Necklace)
// and remain working copy.
const BY_SLUG: Record<string, CategoryContent> = {
  bangles: { eyebrow: "BANGLES", title: "Bangles & Kadas", tagline: "From everyday stacks to festive kadas.", image: `${IMG}cat-bangles.png` },
  necklaces: { eyebrow: "THE NECKLACE EDIT", title: "Necklaces & Sets", tagline: "Chokers, harams and everyday chains for every neckline.", image: `${IMG}cat-necklaces.png` },
  earrings: { eyebrow: "EFFORTLESSLY YOU", title: "Earrings", tagline: "Jhumkas, studs and chandbalis, light enough to wear all day.", image: `${IMG}cat-earrings.png` },
  rings: { eyebrow: "LITTLE DETAILS, LASTING IMPRESSIONS", title: "Rings", tagline: "Cocktail statements and everyday stackables.", image: `${IMG}cat-rings.png` },
  "bridal-sets": { eyebrow: "THE BRIDAL EDIT", title: "Every Ritual, Beautifully Adorned", tagline: "For the moments you’ll carry forever. Discover jewellery for every chapter of your wedding.", image: `${IMG}cat-bridal.png` },
  anklets: { eyebrow: "THE FINISHING TOUCH", title: "Anklets & More", tagline: "Anklets, toe rings and finishing touches.", image: `${IMG}cat-anklets.png` },
  // TODO(figma): confirm copy
  mangalsutras: { eyebrow: "MANGALSUTRAS", title: "Mangalsutras", tagline: "Traditional and modern designs.", image: `${IMG}cat-necklaces.png` },
  // TODO(figma): confirm copy
  bracelets: { eyebrow: "BRACELETS", title: "Bracelets", tagline: "Chains, cuffs and charms.", image: `${IMG}cat-chains.png` },
};

const SALE: CategoryContent = { eyebrow: "FESTIVE SALE", title: "Festive Sale", tagline: "Limited period offers on select designs.", image: `${IMG}hero.png` };
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
