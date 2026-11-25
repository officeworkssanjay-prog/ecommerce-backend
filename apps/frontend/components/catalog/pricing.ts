import type { Product, Variant } from "@/lib/types";
import { effectivePrice } from "@/lib/format";

/** Variant groups a shopper can actually choose from (active group with at least one active option). */
export function activeVariants(product: Pick<Product, "variants">): Variant[] {
  return (product.variants ?? [])
    .filter((v) => v.status !== false)
    .map((v) => ({ ...v, items: (v.items ?? []).filter((i) => i.status !== false) }))
    .filter((v) => v.items.length > 0);
}

/** True when the shopper must pick something: some option group has no default option. */
export const needsOptions = (product: Pick<Product, "variants">) => activeVariants(product).some((g) => !g.items.some((i) => i.isDefault));

/** The default option of every group, in the shape the cart stores (empty when the product has no options). */
export function defaultSelection(product: Pick<Product, "variants">) {
  const variants: Record<string, { id: string; name: string; price: number }> = {};
  for (const group of activeVariants(product)) {
    const item = group.items.find((i) => i.isDefault);
    if (item) variants[group.name] = { id: item.id, name: item.name, price: Number(item.price) };
  }
  const variantTotal = Object.values(variants).reduce((sum, v) => sum + v.price, 0);
  return { variants: Object.keys(variants).length ? variants : undefined, variantTotal };
}

type Priced = Pick<Product, "price" | "offerPrice" | "offerStartDate" | "offerEndDate">;

/** Display-only discount percentage (0 when not discounted). */
export function discountPercent(product: Priced) {
  const price = Number(product.price);
  if (price <= 0) return 0;
  return Math.max(0, Math.round((1 - effectivePrice(product) / price) * 100));
}
