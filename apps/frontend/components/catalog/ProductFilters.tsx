"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { SubCategory } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

export interface FilterValues {
  category: string;
  subCategory: string;
  size: string;
  minPrice: string;
  maxPrice: string;
  sale: boolean;
  search: string;
}

export type FilterUpdates = Partial<Record<keyof FilterValues, string>>;

interface ProductFiltersProps {
  values: FilterValues;
  sizes: string[];
  subCategories: SubCategory[];
  hasActive: boolean;
  showTitle?: boolean;
  onChange: (updates: FilterUpdates) => void;
  onReset: () => void;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="border-b border-sand/70 py-4">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-sm font-semibold text-ink">
        {title}
        <ChevronDown className={cn("h-4 w-4 transition-transform motion-reduce:transition-none", open && "rotate-180")} aria-hidden />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </section>
  );
}

function PriceForm({ values, onChange }: Pick<ProductFiltersProps, "values" | "onChange">) {
  const [min, setMin] = useState(values.minPrice);
  const [max, setMax] = useState(values.maxPrice);
  const [error, setError] = useState<string | null>(null);

  const apply = (e: FormEvent) => {
    e.preventDefault();
    if (min && max && Number(min) > Number(max)) {
      setError("Minimum price cannot be greater than maximum price");
      return;
    }
    setError(null);
    onChange({ minPrice: min, maxPrice: max });
  };

  return (
    <form onSubmit={apply} className="space-y-3" noValidate>
      <div className="grid grid-cols-2 gap-2">
        <Input label="Min" type="number" min={0} inputMode="decimal" placeholder="0" value={min} onChange={(e) => setMin(e.target.value)} />
        <Input label="Max" type="number" min={0} inputMode="decimal" placeholder="Any" value={max} onChange={(e) => setMax(e.target.value)} />
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      <Button type="submit" variant="dark" size="sm" className="w-full">
        Apply
      </Button>
    </form>
  );
}

/** Filter sections shared by the desktop sidebar and the mobile drawer. */
export function ProductFilters({ values, sizes, subCategories, hasActive, showTitle = true, onChange, onReset }: ProductFiltersProps) {
  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        {showTitle ? (
          <h2 className="flex items-center gap-2 font-serif text-lg text-ink">
            <SlidersHorizontal className="h-4 w-4 text-gold-dark" aria-hidden /> Filters
          </h2>
        ) : (
          <span />
        )}
        {hasActive && (
          <button type="button" onClick={onReset} className="text-xs font-medium text-gold-dark hover:underline">
            Reset filters
          </button>
        )}
      </div>

      {sizes.length > 0 && (
        <Section title="Size">
          <ul className="space-y-2">
            {sizes.map((s) => (
              <li key={s}>
                <Checkbox label={s} checked={values.size === s} onChange={(e) => onChange({ size: e.target.checked ? s : "" })} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Price">
        <PriceForm key={`${values.minPrice}|${values.maxPrice}`} values={values} onChange={onChange} />
      </Section>

      {values.category && subCategories.length > 0 && (
        <Section title="Sub-category">
          <ul className="space-y-2">
            {subCategories.map((s) => (
              <li key={s.id}>
                <Checkbox label={s.name} checked={values.subCategory === s.slug} onChange={(e) => onChange({ subCategory: e.target.checked ? s.slug : "" })} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <div className="py-4">
        <Checkbox label="On sale" checked={values.sale} onChange={(e) => onChange({ sale: e.target.checked ? "true" : "" })} />
      </div>
    </div>
  );
}
