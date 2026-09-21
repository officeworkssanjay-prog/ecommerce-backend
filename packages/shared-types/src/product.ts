import { z } from "zod";

export const ProductTypeEnum = z.enum([
  "NEW_ARRIVAL",
  "FEATURED_PRODUCT",
  "TOP_PRODUCT",
  "BEST_PRODUCT",
]);
export type ProductTypeValue = z.infer<typeof ProductTypeEnum>;

export const ProductFilterSchema = z.object({
  category: z.string().optional(),
  subCategory: z.string().optional(),
  childCategory: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(12),
  sort: z.enum(["newest", "price_low", "price_high", "popular"]).default("newest"),
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
