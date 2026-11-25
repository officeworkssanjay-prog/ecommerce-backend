"use client";

import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { ErrorState, PageLoader } from "@/components/ui/States";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { TrustStrip } from "@/components/home/TrustStrip";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { CuratedGrid, Occasions } from "@/components/home/ExploreCards";
import { MostLoved } from "@/components/home/MostLoved";
import { FestiveSale } from "@/components/home/FestiveSale";
import { BrandStory } from "@/components/home/BrandStory";
import { BridalBanner, InstagramStrip, Testimonials } from "@/components/home/SocialSections";
import type { HomeData } from "@/components/home/types";

export default function HomePage() {
  const { data, loading, message, reload } = useApi(async () => (await api.get<HomeData>("/storefront/home")).data);

  return (
    <div className="bg-cream font-sans text-ink selection:bg-gold/30 selection:text-ink">
      {loading && !data ? (
        <PageLoader label="Loading the collection…" className="min-h-[60vh]" />
      ) : !data ? (
        <ErrorState message={message} onRetry={reload} />
      ) : (
        <>
          <HeroCarousel sliders={data.sliders} />
          <TrustStrip />
          <CategoryGrid categories={data.categories} />
          <CuratedGrid />
          <Occasions />
          <MostLoved products={data.bestSellers?.length ? data.bestSellers : data.featuredProducts} />
          <FestiveSale flashSale={data.flashSale} />
          <BrandStory />
          <BridalBanner />
          <Testimonials />
          <InstagramStrip />
        </>
      )}
    </div>
  );
}
