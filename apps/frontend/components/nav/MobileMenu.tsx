"use client";

import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import type { NavItem } from "./navLinks";

interface Props {
  id: string;
  items: NavItem[];
  query: string;
  onQuery: (q: string) => void;
  onSubmit: (q: string) => void;
  onNavigate: () => void;
}

export function MobileMenu({ id, items, query, onQuery, onSubmit, onNavigate }: Props) {
  return (
    <div id={id} className="max-h-[calc(100vh-76px)] space-y-4 overflow-y-auto border-b border-ink-soft bg-ink px-4 py-5 text-white lg:hidden">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) onSubmit(query.trim());
        }}
        className="mb-3 flex items-center gap-2"
      >
        <input
          type="search"
          aria-label="Search jewellery"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          maxLength={100}
          placeholder="Search jewellery..."
          className="flex-1 rounded-lg bg-white px-3 py-2 text-sm text-ink focus:outline-none"
        />
        <button type="submit" aria-label="Search" className="rounded-lg bg-gold p-2.5 text-ink-deep">
          <Search className="h-4 w-4" aria-hidden />
        </button>
      </form>
      <nav aria-label="Shop by category" className="flex flex-col divide-y divide-ink-soft">
        {items.map((item) => (
          <div key={item.key}>
            <Link href={item.href} onClick={onNavigate} className={`flex items-center justify-between py-3 text-sm ${item.sale ? "font-semibold text-danger" : "font-medium text-cream"}`}>
              {item.label}
              <ChevronDown className="h-4 w-4 -rotate-90 text-cream/40" aria-hidden />
            </Link>
            {item.children && (
              <ul className="mb-2 space-y-1 border-l border-gold/30 pl-4">
                {item.children.map((c) => (
                  <li key={c.slug}>
                    <Link href={c.href} onClick={onNavigate} className="block py-1.5 text-sm text-cream/70 hover:text-gold-light">
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
