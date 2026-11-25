import Link from "next/link";
import type { CategoryContent } from "./category-content";

export function Breadcrumb({ title }: { title: string }) {
  return (
    <nav aria-label="Breadcrumb" className="bg-white">
      <ol className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-4 text-xs text-ink/55 sm:px-6 lg:px-8">
        <li>
          <Link href="/" className="hover:text-gold-dark">
            Home
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li aria-current="page" className="text-ink">
          {title}
        </li>
      </ol>
    </nav>
  );
}

/** Dark intro banner with the photo on the right half under a gradient. */
export function CategoryBanner({ content, image }: { content: CategoryContent; image: string }) {
  return (
    <section aria-label={content.title} className="relative isolate overflow-hidden bg-ink-deep text-white">
      <div className="absolute inset-y-0 right-0 -z-10 w-full sm:w-1/2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-deep via-ink-deep/70 to-ink-deep/30 sm:via-ink-deep/40 sm:to-transparent" />
      </div>
      <div className="mx-auto flex min-h-64 max-w-7xl flex-col justify-center gap-3 px-4 py-12 sm:min-h-[340px] sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{content.eyebrow}</p>
        <h1 className="max-w-xl font-serif text-3xl text-white sm:text-5xl">{content.title}</h1>
        {content.tagline && <p className="max-w-md text-sm text-white/75 sm:text-base">{content.tagline}</p>}
      </div>
    </section>
  );
}
