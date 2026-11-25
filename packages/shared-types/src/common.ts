import { z } from "zod";

/** Query strings arrive as text; treat "" the same as "not provided". */
export const emptyToUndefined = (value: unknown) => (value === "" || value === null ? undefined : value);

export const IdParamSchema = z.object({ id: z.string().uuid("Invalid id") });
export const ProductIdParamSchema = z.object({ productId: z.string().uuid("Invalid product") });
export const SlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9-]+$/i, "Invalid slug"),
});

export const PaginationQuerySchema = z.object({
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(10000).default(1)),
  limit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(60).default(12)),
});
