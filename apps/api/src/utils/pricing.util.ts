export interface CartLineItem {
  id: string; // product id
  name: string;
  price: number;
  qty: number;
  variantTotal: number;
  variants?: Record<string, { id: string; name: string; price: number }>;
}

export interface AppliedCoupon {
  code: string;
  discountType: "PERCENT" | "AMOUNT";
  discount: number;
}

export interface AppliedShipping {
  id: string;
  name: string;
  cost: number;
}

/**
 * Calculates subtotal for all items in the cart:
 * sum of ((unit_price + variant_total) * qty)
 */
export function calculateSubTotal(items: CartLineItem[]): number {
  return items.reduce((sum, item) => {
    return sum + (item.price + (item.variantTotal || 0)) * item.qty;
  }, 0);
}

/**
 * Calculates coupon savings based on discount type (PERCENT or AMOUNT)
 */
export function calculateCouponDiscount(
  subTotal: number,
  coupon?: AppliedCoupon | null
): number {
  if (!coupon) return 0;

  if (coupon.discountType === "AMOUNT") {
    return Math.min(coupon.discount, subTotal);
  } else if (coupon.discountType === "PERCENT") {
    const discount = (subTotal * coupon.discount) / 100;
    return Math.min(discount, subTotal);
  }

  return 0;
}

/**
 * Calculates the final total payable amount
 */
export function calculateFinalPayableAmount(
  subTotal: number,
  discount: number,
  shippingCost: number
): number {
  const discountedSubTotal = Math.max(0, subTotal - discount);
  return Number((discountedSubTotal + (shippingCost || 0)).toFixed(2));
}

/**
 * Converts store base currency to external payment gateway currency using rate multiplier
 */
export function convertToGatewayCurrency(
  payableAmount: number,
  currencyRate: number
): number {
  return Number((payableAmount * currencyRate).toFixed(2));
}
