import { z } from "zod";
import { emptyToUndefined } from "./common";

export const ProductTypeEnum = z.enum([
  "NEW_ARRIVAL",
  "FEATURED_PRODUCT",
  "TOP_PRODUCT",
  "BEST_PRODUCT",
]);
export type ProductTypeValue = z.infer<typeof ProductTypeEnum>;

const optionalText = (max: number) => z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());
const optionalPrice = z.preprocess(emptyToUndefined, z.coerce.number().min(0, "Price cannot be negative").max(10_000_000).optional());

export const ProductFilterSchema = z
  .object({
    category: optionalText(100),
    subCategory: optionalText(100),
    childCategory: optionalText(100),
    brand: optionalText(100),
    minPrice: optionalPrice,
    maxPrice: optionalPrice,
    search: optionalText(100),
    page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(10000).default(1)),
    limit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(60).default(12)),
    sort: z.preprocess(emptyToUndefined, z.enum(["recommended", "newest", "price_low", "price_high", "popular"]).default("recommended")),
    /** Only products with a currently valid offer price ("Sale"). Accepts true/1. */
    sale: z.preprocess((v) => (v === "" || v === undefined ? undefined : v === true || v === "true" || v === "1"), z.boolean().optional()),
    /** Variant option name, e.g. a bangle size "2.4". */
    size: optionalText(20),
  })
  .refine((q) => q.minPrice === undefined || q.maxPrice === undefined || q.minPrice <= q.maxPrice, {
    message: "Minimum price cannot be greater than maximum price",
    path: ["minPrice"],
  });
export type ProductFilterInput = z.infer<typeof ProductFilterSchema>;

export const CreateProductSchema = z.object({
  name: z.string().min(3),
  categoryId: z.string().uuid(),
  subCategoryId: z.string().uuid().optional(),
  childCategoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  qty: z.number().int().nonnegative(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  price: z.number().positive(),
  offerPrice: z.number().positive().optional(),
  offerStartDate: z.string().datetime().optional(),
  offerEndDate: z.string().datetime().optional(),
  productType: ProductTypeEnum.optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
