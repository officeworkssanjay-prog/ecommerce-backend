/** Store currency. The API stores plain numbers; change these two env vars to switch currency everywhere. */
const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY_CODE || "INR";
const LOCALE = process.env.NEXT_PUBLIC_LOCALE || "en-IN";

const money = new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY, maximumFractionDigits: 2 });
const moneyWhole = new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 });

export const formatMoney = (amount: number | null | undefined) => money.format(Number(amount ?? 0));

/** No decimals when the amount is a whole number (cards, headings); decimals otherwise. */
export const formatPrice = (amount: number | null | undefined) => {
  const n = Number(amount ?? 0);
  return Number.isInteger(n) ? moneyWhole.format(n) : money.format(n);
};

export const formatDate = (value: string | Date | null | undefined) =>
  value ? new Date(value).toLocaleDateString(LOCALE, { day: "numeric", month: "short", year: "numeric" }) : "";

export const formatDateTime = (value: string | Date | null | undefined) =>
  value
    ? new Date(value).toLocaleString(LOCALE, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    : "";

/** "PROCESSED_AND_READY_TO_SHIP" -> "Processed and ready to ship" */
export const humanize = (value: string) => {
  const s = value.toLowerCase().replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** Price actually charged: the offer price while the offer window is open, otherwise the regular price. */
export function effectivePrice(p: { price: number; offerPrice?: number | null; offerStartDate?: string | null; offerEndDate?: string | null }) {
  const now = Date.now();
  const active =
    p.offerPrice != null &&
    (!p.offerStartDate || new Date(p.offerStartDate).getTime() <= now) &&
    (!p.offerEndDate || new Date(p.offerEndDate).getTime() >= now);
  return active ? Number(p.offerPrice) : Number(p.price);
}
