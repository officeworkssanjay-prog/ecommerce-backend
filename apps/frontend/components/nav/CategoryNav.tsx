"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { activeNavKey, type NavItem } from "./navLinks";

const base = "relative flex items-center gap-1 py-2 text-[14.5px] font-medium tracking-wide transition-colors";
const tone = (item: NavItem, active: boolean) => (item.sale ? "text-danger hover:opacity-80" : active ? "text-gold-light" : "text-cream hover:text-gold-light");
const underline = <span aria-hidden className="absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full bg-gold" />;
const dropdownLink = "block px-4 py-2 text-sm text-cream hover:bg-white/5 hover:text-gold-light";

function Dropdown({ item, active }: { item: NavItem; active: boolean }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(!open)} className={cn(base, tone(item, active))}>
        {item.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden />
        {active && underline}
      </button>
      {open && (
        <ul className="absolute left-1/2 top-full z-50 max-h-[70vh] w-52 overflow-y-auto -translate-x-1/2 rounded-xl border border-ink-soft bg-ink py-2 shadow-2xl">
          {item.children?.map((c) => (
            <li key={c.slug}>
              <Link href={c.href} onClick={() => setOpen(false)} className={dropdownLink}>
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Desktop navigation. `activeKey` marks the current item with a gold underline. */
export function CategoryNav({ items, activeKey }: { items: NavItem[]; activeKey: string | null }) {
  return (
    <nav aria-label="Shop by category" className="hidden h-full items-center gap-6 lg:flex xl:gap-9">
      {items.map((item) =>
        item.children ? (
          <Dropdown key={item.key} item={item} active={activeKey === item.key} />
        ) : (
          <Link key={item.key} href={item.href} aria-current={activeKey === item.key ? "page" : undefined} className={cn(base, tone(item, activeKey === item.key))}>
            {item.label}
            {activeKey === item.key && underline}
          </Link>
        )
      )}
    </nav>
  );
}

/** Reads the URL, so it must sit inside <Suspense>. */
export function ActiveCategoryNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const params = useSearchParams();
  return <CategoryNav items={items} activeKey={activeNavKey(items, pathname, params)} />;
}
