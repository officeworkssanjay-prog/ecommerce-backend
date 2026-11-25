import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="font-serif text-6xl text-gold">404</p>
      <h1 className="font-serif text-2xl text-ink">We couldn’t find that page</h1>
      <p className="max-w-md text-sm text-ink/60">The link may be broken or the piece may no longer be available.</p>
      <Link href="/products" className={buttonClasses("primary", "lg")}>
        Browse the collection
      </Link>
    </div>
  );
}
