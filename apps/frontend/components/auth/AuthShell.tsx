import type { ReactNode } from "react";

/** Only same-site paths are honoured after login: must start with a single "/" (rejects "//host" and absolute URLs). */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-sand bg-white p-8 shadow-card sm:p-10">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold font-extrabold text-ink-deep shadow-md" aria-hidden>
            SJ
          </div>
          <h1 className="font-serif text-2xl text-ink">{title}</h1>
          <p className="text-xs text-ink/60">{subtitle}</p>
        </div>
        {children}
        <div className="border-t border-sand pt-4 text-center text-xs text-ink/60">{footer}</div>
      </div>
    </div>
  );
}
