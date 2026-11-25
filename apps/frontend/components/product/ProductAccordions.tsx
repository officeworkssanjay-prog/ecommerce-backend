import type { ReactNode } from "react";
import { Lock, RotateCcw, Truck } from "lucide-react";
import type { Product } from "@/lib/types";

const trust = [
  { icon: Truck, text: "Free shipping above ₹499" },
  { icon: RotateCcw, text: "7-Day Easy Returns" },
  { icon: Lock, text: "Secure Payments" },
];

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="space-y-3">
      {text
        .split(/\n+/)
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </div>
  );
}

export function ProductAccordions({ product }: { product: Product }) {
  const description = product.longDescription || product.shortDescription;
  const details: [string, string][] = [];
  if (product.category?.name) details.push(["Category", product.category.name]);
  if (product.brand?.name) details.push(["Brand", product.brand.name]);
  if (product.sku) details.push(["SKU", product.sku]);

  const sections: { title: string; body: ReactNode }[] = [
    ...(description ? [{ title: "Description", body: <Paragraphs text={description} /> }] : []),
    ...(details.length > 0 ? [{
      title: "Product Details",
      body: (
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
          {details.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-ink/55">{k}</dt>
              <dd className="text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      ),
    }] : []),
    {
      title: "Shipping & Returns",
      body: (
        <ul className="list-disc space-y-1 pl-5">
          <li>Free shipping above ₹499.</li>
          <li>7-day easy returns.</li>
          <li>Secure payments: UPI, Cards and Cash on Delivery.</li>
        </ul>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {trust.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2 border border-sand bg-white px-3 py-2.5 text-xs text-ink/80">
            <Icon className="h-4 w-4 shrink-0 text-gold-dark" aria-hidden />
            {text}
          </li>
        ))}
      </ul>
      <div className="divide-y divide-sand border-y border-sand">
        {sections.map((s, i) => (
          <details key={s.title} open={i === 0} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
              {s.title}
              <span aria-hidden className="text-lg text-gold-dark group-open:hidden">
                +
              </span>
              <span aria-hidden className="hidden text-lg text-gold-dark group-open:inline">
                −
              </span>
            </summary>
            <div className="pt-3 text-sm leading-relaxed text-ink/70">{s.body}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
