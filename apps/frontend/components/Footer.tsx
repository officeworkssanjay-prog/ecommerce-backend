import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";

type FooterLink = { label: string; href?: string };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Bangles", href: "/products?category=bangles" },
      { label: "Necklace", href: "/products?category=necklaces" },
      { label: "Earrings", href: "/products?category=earrings" },
      { label: "Rings", href: "/products?category=rings" },
      { label: "Bridal", href: "/products?category=bridal-sets" },
      { label: "Anklets & Others", href: "/products?category=anklets" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "New Arrivals", href: "/products?sort=newest" },
      { label: "Bestsellers", href: "/products?sort=popular" },
      { label: "Sale", href: "/products?sale=true" },
      { label: "Gift Cards", href: "/gift-cards" },
    ],
  },
  {
    title: "Help",
    links: [{ label: "Track Order", href: "/order-track" }, { label: "Returns", href: "/returns" }, { label: "Shipping", href: "/shipping" }, { label: "Jewellery Care", href: "/jewellery-care" }, { label: "FAQs", href: "/faqs" }],
  },
  {
    title: "Company",
    links: [{ label: "Our Story", href: "/about" }, { label: "Contact", href: "/contact" }, { label: "Careers", href: "/careers" }, { label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }],
  },
];

const socialClass = "flex h-9 w-9 items-center justify-center rounded-full border border-gold text-gold transition-colors hover:bg-gold hover:text-ink-deep";

const socials = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" className="fill-ink-deep" />
      </svg>
    ),
  },
];

const payments = ["UPI", "VISA", "Mastercard", "RuPay", "COD"];

export function Footer() {
  return (
    <footer className="w-full font-sans">
      <div className="bg-ink px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1340px] flex-col items-center justify-between gap-8 md:flex-row">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">Be the First to Know</h2>
            <p className="max-w-lg text-sm text-white/60">Get early access to new collections and exclusive offers.</p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="bg-ink-deep px-4 pb-8 pt-16 text-white/60 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1340px]">
          <div className="grid grid-cols-2 gap-10 lg:grid-cols-[1.6fr_repeat(4,1fr)]">
            <div className="col-span-2 space-y-5 lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <span aria-hidden className="h-7 w-7 rounded-full border-2 border-gold" />
                <span className="font-serif text-2xl font-bold text-white">Sawariya Jewels</span>
              </Link>
              <p className="max-w-xs text-sm leading-relaxed">Elegant jewellery, affordable price. Handcrafted with love for the modern Indian woman.</p>
              <div className="flex gap-3">
                {socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className={socialClass}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="mb-4 text-sm font-bold text-white">{col.title}</h3>
                <ul className="space-y-2.5 text-sm">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.href ? (
                        <Link href={l.href} className="transition-colors hover:text-gold">
                          {l.label}
                        </Link>
                      ) : (
                        <span>{l.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row">
            <p>© {new Date().getFullYear()} Sawariya Jewels</p>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-1" aria-label="Accepted payment methods">
              {payments.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
