import type { Brand, Category, FlashSale, Product, Slider } from "@/lib/types";

/** Response of GET /storefront/home */
export interface HomeData {
  sliders: Slider[];
  categories: Category[];
  flashSale: FlashSale | null;
  brands: Brand[];
  newArrivals: Product[];
  featuredProducts: Product[];
  bestSellers?: Product[];
}
