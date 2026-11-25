import { Prisma } from "@ecommerce/database";
import { CartItemInput } from "@ecommerce/shared-types";
import { AppError } from "../utils/errors";

/** Works with both the global client and an interactive transaction client. */
export type Db = Prisma.TransactionClient;

/** All money maths is done in integer minor units (cents/paise) to avoid float drift. */
export const toCents = (value: Prisma.Decimal | number | string | null | undefined): number =>
  Math.round(Number(value ?? 0) * 100);
export const fromCents = (cents: number): number => cents / 100;

export interface PricedLine {
  productId: string;
  productName: string;
  slug: string;
  thumbImage: string;
  qty: number;
  unitPriceCents: number;
  variantTotalCents: number;
  lineTotalCents: number;
  variants: Record<string, { id: string; name: string; price: number }>;
}

export interface CouponResult {
  id: string;
  code: string;
  name: string;
  discountType: "PERCENT" | "AMOUNT";
  discount: number;
  quantity: number;
}

export interface ShippingResult {
  id: string;
  name: string;
  type: string;
  costCents: number;
}

export interface PricedOrder {
  lines: PricedLine[];
  subTotalCents: number;
  discountCents: number;
  shippingCents: number;
  /** % off for online payment, in cents */
  prepaidDiscountCents: number;
  codFeeCents: number;
  giftWrap: boolean;
  giftWrapFeeCents: number;
  totalCents: number;
  coupon: CouponResult | null;
  couponError: string | null;
  shipping: ShippingResult | null;
}

/** Loads prices from the database and validates variants and availability for every cart line. */
export async function priceCart(db: Db, items: CartItemInput[]): Promise<PricedLine[]> {
  const ids = [...new Set(items.map((i) => i.productId))];
  const products = await db.product.findMany({
    where: { id: { in: ids }, status: true },
    include: {
      variants: { where: { status: true }, include: { items: { where: { status: true } } } },
    },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  const now = new Date();

  const lines = items.map((item): PricedLine => {
    const product = byId.get(item.productId);
    if (!product) {
      throw AppError.badRequest("One or more items in your cart are no longer available");
    }

    const offerActive =
      product.offerPrice !== null &&
      (!product.offerStartDate || product.offerStartDate <= now) &&
      (!product.offerEndDate || product.offerEndDate >= now);
    const unitPriceCents = toCents(offerActive ? product.offerPrice : product.price);

    // Resolve the selected option per variant group; fall back to the default option.
    const chosen: PricedLine["variants"] = {};
    for (const raw of Object.values(item.variants ?? {})) {
      const optionId = typeof raw === "string" ? raw : raw.id;
      const group = product.variants.find((v) => v.items.some((o) => o.id === optionId));
      const option = group?.items.find((o) => o.id === optionId);
      if (!group || !option) {
        throw AppError.badRequest(`An option selected for "${product.name}" is no longer available`);
      }
      if (chosen[group.name]) {
        throw AppError.badRequest(`Select only one "${group.name}" option for "${product.name}"`);
      }
      chosen[group.name] = { id: option.id, name: option.name, price: Number(option.price) };
    }
    for (const group of product.variants) {
      if (chosen[group.name]) continue;
      const fallback = group.items.find((o) => o.isDefault);
      if (fallback) {
        chosen[group.name] = { id: fallback.id, name: fallback.name, price: Number(fallback.price) };
      } else if (group.items.length > 0) {
        throw AppError.badRequest(`Please choose a "${group.name}" option for "${product.name}"`);
      }
    }

    const variantTotalCents = Object.values(chosen).reduce((sum, o) => sum + toCents(o.price), 0);

    return {
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      thumbImage: product.thumbImage,
      qty: item.qty,
      unitPriceCents,
      variantTotalCents,
      lineTotalCents: (unitPriceCents + variantTotalCents) * item.qty,
      variants: chosen,
    };
  });

  // Stock is checked on the combined quantity per product (the same piece may appear on several lines).
  const wanted = new Map<string, number>();
  for (const line of lines) wanted.set(line.productId, (wanted.get(line.productId) ?? 0) + line.qty);
  for (const [productId, qty] of wanted) {
    const product = byId.get(productId)!;
    if (product.qty < qty) {
      throw AppError.conflict(
        product.qty === 0
          ? `"${product.name}" is out of stock`
          : `Only ${product.qty} of "${product.name}" left in stock`
      );
    }
  }

  return lines;
}

/** Validates a coupon for this cart and user. Throws AppError(400) with a reason when it can't be used. */
export async function resolveCoupon(
  db: Db,
  code: string,
  subTotalCents: number,
  userId?: string
): Promise<{ coupon: CouponResult; discountCents: number }> {
  const found = await db.coupon.findFirst({ where: { code: { equals: code, mode: "insensitive" } } });
  const now = new Date();

  if (!found || !found.status) throw AppError.badRequest("This coupon code is not valid");
  if (now < found.startDate) throw AppError.badRequest("This coupon is not active yet");
  if (now > found.endDate) throw AppError.badRequest("This coupon has expired");
  if (found.totalUsed >= found.quantity) throw AppError.badRequest("This coupon has been fully redeemed");

  if (userId) {
    const used = await db.order.count({
      where: {
        userId,
        orderStatus: { not: "CANCELED" },
        coupon: { path: ["code"], equals: found.code },
      },
    });
    if (used >= found.maxUse) {
      throw AppError.badRequest("You have already used this coupon the maximum number of times");
    }
  }

  const raw =
    found.discountType === "PERCENT"
      ? Math.round((subTotalCents * Number(found.discount)) / 100)
      : toCents(found.discount);

  return {
    coupon: {
      id: found.id,
      code: found.code,
      name: found.name,
      discountType: found.discountType,
      discount: Number(found.discount),
      quantity: found.quantity,
    },
    discountCents: Math.min(raw, subTotalCents),
  };
}

/** Picks the requested shipping rule (must be active and eligible) or the cheapest eligible one. */
export async function resolveShipping(
  db: Db,
  subTotalCents: number,
  ruleId?: string
): Promise<ShippingResult | null> {
  const rules = await db.shippingRule.findMany({ where: { status: true }, orderBy: { cost: "asc" } });
  const eligible = rules.filter((r) => r.type !== "min_cost" || subTotalCents >= toCents(r.minCost));

  const pick = ruleId ? eligible.find((r) => r.id === ruleId) : eligible[0];
  if (ruleId && !pick) {
    throw AppError.badRequest("The selected shipping method is not available for this order");
  }
  return pick ? { id: pick.id, name: pick.name, type: pick.type, costCents: toCents(pick.cost) } : null;
}

/**
 * Prices a whole order from database values only. With `strictCoupon: false` (cart preview) an
 * unusable coupon is reported in `couponError` instead of failing the request.
 */
export async function priceOrder(
  db: Db,
  input: { items: CartItemInput[]; couponCode?: string; shippingRuleId?: string; userId?: string; strictCoupon: boolean; paymentMethod?: "COD" | "RAZORPAY"; giftWrap?: boolean }
): Promise<PricedOrder> {
  const lines = await priceCart(db, input.items);
  const subTotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);

  let coupon: CouponResult | null = null;
  let couponError: string | null = null;
  let discountCents = 0;
  if (input.couponCode) {
    try {
      ({ coupon, discountCents } = await resolveCoupon(db, input.couponCode, subTotalCents, input.userId));
    } catch (err) {
      if (input.strictCoupon || !(err instanceof AppError)) throw err;
      couponError = err.message;
    }
  }

  const discountedCents = Math.max(0, subTotalCents - discountCents);
  const shipping = await resolveShipping(db, discountedCents, input.shippingRuleId);
  const shippingCents = shipping?.costCents ?? 0;

  // Store-configured rules: prepaid discount (online payment), COD fee, optional gift wrap.
  const general = await db.generalSetting.findFirst();
  const prepaidDiscountCents =
    input.paymentMethod === "RAZORPAY"
      ? Math.min(discountedCents, Math.round((discountedCents * Number(general?.prepaidDiscountPercent ?? 0)) / 100))
      : 0;
  const codFeeCents = input.paymentMethod === "COD" ? toCents(general?.codFee) : 0;
  const giftWrap = Boolean(input.giftWrap);
  const giftWrapFeeCents = giftWrap ? toCents(general?.giftWrapFee) : 0;

  return {
    lines,
    subTotalCents,
    discountCents,
    shippingCents,
    prepaidDiscountCents,
    codFeeCents,
    giftWrap,
    giftWrapFeeCents,
    totalCents: discountedCents + shippingCents + codFeeCents + giftWrapFeeCents - prepaidDiscountCents,
    coupon,
    couponError,
    shipping,
  };
}
