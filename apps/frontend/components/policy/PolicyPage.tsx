import Link from "next/link";
import type { ReactNode } from "react";

export type PolicySection = { heading: string; body: ReactNode };

export function PolicyPage({ title, intro, sections }: { title: string; intro?: string; sections: PolicySection[] }) {
  return (
    <main className="bg-cream font-sans text-ink">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink/60">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="transition-colors hover:text-gold-dark">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">
              {title}
            </li>
          </ol>
        </nav>
        <h1 className="font-serif text-3xl font-bold sm:text-4xl">{title}</h1>
        {intro && <p className="mt-4 leading-relaxed text-ink/70">{intro}</p>}
        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.heading} className="space-y-3">
              <h2 className="font-serif text-xl font-bold sm:text-2xl">{s.heading}</h2>
              <div className="space-y-3 leading-relaxed text-ink/80">{s.body}</div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

const link = "font-medium text-gold-dark underline underline-offset-2 hover:text-ink";

export function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={link}>
      {children}
    </Link>
  );
}

export function ContactLink({ children = "contact us" }: { children?: ReactNode }) {
  return <InlineLink href="/contact">{children}</InlineLink>;
}

export function Pending({ text = "This policy is being finalised by the store." }: { text?: string }) {
  return (
    <div className="rounded-md border border-gold bg-parchment p-4">
      <p>
        {text} For questions please <ContactLink />.
      </p>
    </div>
  );
}
