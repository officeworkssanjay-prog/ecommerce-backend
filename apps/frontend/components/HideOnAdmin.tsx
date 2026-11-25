"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** The admin area has its own layout, so the storefront header, footer and cart are not rendered there. */
export function HideOnAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return <>{children}</>;
}
