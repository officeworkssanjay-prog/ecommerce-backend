import type { Metadata } from "next";
import { ProductDetail } from "@/components/product/ProductDetail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Page title/description come from the product itself; falls back to the root defaults if the API is unreachable. */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const origin = process.env.BACKEND_ORIGIN || "http://localhost:5000";
  try {
    const res = await fetch(`${origin}/api/storefront/products/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
    if (!res.ok) return { title: "Product" };
    const { data } = (await res.json()) as { data?: { name?: string; seoTitle?: string | null; seoDescription?: string | null; shortDescription?: string | null } };
    return {
      title: data?.seoTitle || data?.name || "Product",
      description: data?.seoDescription || data?.shortDescription || undefined,
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
