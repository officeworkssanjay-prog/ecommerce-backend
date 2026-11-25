import { Suspense } from "react";
import { PageLoader } from "@/components/ui/States";
import { ProductsView } from "@/components/catalog/ProductsView";

export const metadata = {
  title: "Shop Jewellery",
  description: "Browse necklaces, bangles, earrings, rings and bridal sets from Sawariya Jewels.",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading jewellery…" />}>
      <ProductsView />
    </Suspense>
  );
}
