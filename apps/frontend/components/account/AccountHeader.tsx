import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Shared top of every /account/* page. */
export function AccountHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1">
        <Link href="/account" className="inline-flex items-center gap-1 text-xs font-semibold text-gold-dark hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> My account
        </Link>
        <h1 className="font-serif text-3xl text-ink">{title}</h1>
        {description && <p className="text-sm text-ink/60">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function AccountPage({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">{children}</div>;
}
