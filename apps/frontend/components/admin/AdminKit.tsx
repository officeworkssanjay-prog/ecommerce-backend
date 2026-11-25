"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { EmptyState, Skeleton } from "@/components/ui/States";

/** Title row for an admin page: heading on the left, primary actions on the right. */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-serif text-2xl text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink/60">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export interface Column<T> {
  key: string;
  header: string;
  /** Cell renderer. Defaults to row[key]. */
  render?: (row: T) => ReactNode;
  className?: string;
}

/** Simple responsive table with loading skeleton and empty state. */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  loading,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction,
}: {
  columns: Column<T>[];
  rows: T[] | null | undefined;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-sand bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-parchment/60 text-xs uppercase tracking-wider text-ink/60">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn("px-4 py-3 font-semibold", c.className)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-sand">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[10rem]" />
                    </td>
                  ))}
                </tr>
              ))
            : (rows ?? []).map((row) => (
                <tr key={row.id} className="hover:bg-cream/70">
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-3 align-middle text-ink", c.className)}>
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
      {!loading && (rows?.length ?? 0) === 0 && <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />}
    </div>
  );
}

/** On/off pill used for the status columns. */
export function StatusPill({ active, onLabel = "Active", offLabel = "Disabled" }: { active: boolean; onLabel?: string; offLabel?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", active ? "bg-success/15 text-success" : "bg-ink/10 text-ink/60")}>
      {active ? onLabel : offLabel}
    </span>
  );
}
