import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { CartItem } from "@/context/CartContext";
import type { PricedItem } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { QuantityStepper } from "./QuantityStepper";

interface Props {
  item: CartItem;
  /** Server price for this line (undefined while loading or when pricing failed). */
  priced?: PricedItem;
  onQty: (qty: number) => void;
  onRemove: () => void;
  onNavigate?: () => void;
  compact?: boolean;
}

/** Display comes from the stored snapshot (name, image, options); money only from the server's pricing. */
export function CartLine({ item, priced, onQty, onRemove, onNavigate, compact }: Props) {
  const options = item.variants ? Object.values(item.variants).map((v) => v.name) : [];
  const remove = (
    <button type="button" onClick={onRemove} aria-label={`Remove ${item.name} from cart`} className="rounded text-xs font-medium text-gold-dark underline-offset-2 hover:underline">
      Remove
    </button>
  );
  return (
    <li className={cn("flex gap-4", compact ? "py-4" : "rounded-md border border-sand bg-white p-4 sm:p-5")}>
      <div className={cn("shrink-0 overflow-hidden rounded-md border border-sand bg-parchment", compact ? "h-20 w-20" : "h-24 w-24 sm:h-[90px] sm:w-[90px]")}>
        {item.thumbImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.thumbImage} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gold-dark">
            <ShoppingBag className="h-6 w-6" aria-hidden />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/products/${item.slug}`} onClick={onNavigate} className="text-sm font-semibold text-ink hover:text-gold-dark">
            {item.name}
          </Link>
          <span className="shrink-0 text-sm font-semibold text-ink">{priced ? formatPrice(priced.lineTotal) : "…"}</span>
        </div>
        {options.length > 0 && <p className="text-xs text-ink/60">{options.join(" · ")}</p>}
        {priced && <p className="text-xs text-ink/60">{formatPrice(priced.unitPrice + priced.variantTotal)} each</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <QuantityStepper qty={item.qty} name={item.name} onChange={onQty} size={compact ? "sm" : "md"} />
          {remove}
        </div>
      </div>
    </li>
  );
}

/** Finds the server's line for a cart line (same order, same product and quantity). */
export function pricedFor(index: number, item: CartItem, lines: PricedItem[] | undefined): PricedItem | undefined {
  const line = lines?.[index];
  return line && line.productId === item.productId && line.qty === item.qty ? line : undefined;
}
