"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Store,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";

export default function StorefrontHomePage() {
  const { addItem, getItemCount } = useCartStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? getItemCount() : 0;

  // Mock initial showcase products
  const products = [
    {
      id: "prod-1",
      name: "Ultra-Thin Pro Wireless Earbuds",
      slug: "ultra-thin-pro-wireless-earbuds",
      price: 129.99,
      offerPrice: 89.99,
      category: "Audio & Accessories",
      rating: 4.8,
      reviewsCount: 142,
      badge: "HOT DEAL",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80",
    },
    {
      id: "prod-2",
      name: "Titanium Mechanical Chronograph",
      slug: "titanium-mechanical-chronograph",
      price: 299.0,
      offerPrice: 249.0,
      category: "Watches & Jewelry",
      rating: 4.9,
      reviewsCount: 88,
      badge: "FEATURED",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
    },
    {
      id: "prod-3",
      name: "Smart 4K Drone with Gimbal Stabilizer",
      slug: "smart-4k-drone-with-gimbal",
      price: 799.0,
      offerPrice: 649.0,
      category: "Photography",
      rating: 4.7,
      reviewsCount: 56,
      badge: "TOP PRODUCT",
      image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=500&auto=format&fit=crop&q=80",
    },
    {
      id: "prod-4",
      name: "Ergonomic Mesh Executive Chair",
      slug: "ergonomic-mesh-executive-chair",
      price: 349.99,
      offerPrice: 289.99,
      category: "Office & Furniture",
      rating: 4.6,
      reviewsCount: 94,
      badge: "NEW ARRIVAL",
      image: "https://images.unsplash.com/photo-1580481077195-c9925fa3b9b4?w=500&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-xl text-primary">
              <Sparkles className="h-6 w-6 text-primary" />
              <span>NEXUS<span className="text-foreground">COMMERCE</span></span>
            </Link>
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-muted-foreground">
              <Link href="/products" className="transition hover:text-foreground">Catalog</Link>
              <Link href="/flash-sale" className="flex items-center gap-1 text-amber-500 hover:text-amber-400">
                <Zap className="h-4 w-4" /> Flash Deals
              </Link>
              <Link href="/vendor" className="transition hover:text-foreground">Stores</Link>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search across 10,000+ verified products..."
              className="w-full rounded-full border border-input bg-secondary/50 px-9 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          {/* Portal Links & Actions */}
          <div className="flex items-center gap-3">
            <Link href="/vendor/dashboard">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <Store className="h-4 w-4" /> Merchant Portal
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <Layers className="h-4 w-4" /> Admin Console
              </Button>
            </Link>
            <Link href="/cart" className="relative">
              <Button variant="outline" size="icon" className="relative rounded-full">
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="rounded-full px-4">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
            <Zap className="h-3.5 w-3.5" /> Next-Generation Multi-Tenant Marketplace
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight md:leading-tight">
            Curated Global Products from <span className="bg-gradient-to-r from-primary via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Verified Merchants</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience lightning-fast shopping with real-time merchant messaging, immutable order snapshots, and protected multi-gateway checkout.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="rounded-full px-8 gap-2 shadow-lg shadow-primary/25">
              <ShoppingBag className="h-5 w-5" /> Explore Marketplace
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 gap-2">
              <Store className="h-5 w-5" /> Open Your Shop
            </Button>
          </div>
        </div>
      </section>

      {/* 3. Platform Assurance Strip */}
      <section className="border-y border-border/50 bg-secondary/30 py-8">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary"><ShieldCheck className="h-6 w-6" /></div>
            <div>
              <h4 className="font-semibold text-sm">Verified Merchants</h4>
              <p className="text-xs text-muted-foreground">Admin-moderated quality catalog</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary"><Truck className="h-6 w-6" /></div>
            <div>
              <h4 className="font-semibold text-sm">Tracked Logistics</h4>
              <p className="text-xs text-muted-foreground">7-stage real-time parcel updates</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary"><RotateCcw className="h-6 w-6" /></div>
            <div>
              <h4 className="font-semibold text-sm">Buyer Protection</h4>
              <p className="text-xs text-muted-foreground">Payouts held until delivery confirmation</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary"><Zap className="h-6 w-6" /></div>
            <div>
              <h4 className="font-semibold text-sm">Instant Settlement</h4>
              <p className="text-xs text-muted-foreground">Stripe, PayPal, Razorpay & COD</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Trending & Featured Products Showcase */}
      <section className="py-16 container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Featured Highlights</h2>
            <p className="text-sm text-muted-foreground">Handpicked top-rated products from our verified merchant network</p>
          </div>
          <Link href="/products">
            <Button variant="ghost" className="text-primary hover:text-primary">View All &rarr;</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <Card key={p.id} className="group overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-xl">
              <div className="relative aspect-square w-full overflow-hidden bg-secondary">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
                <Badge variant="secondary" className="absolute top-3 left-3 bg-background/80 backdrop-blur text-[11px] font-semibold">
                  {p.badge}
                </Badge>
              </div>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{p.category}</p>
                <h3 className="mt-1 font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">{p.name}</h3>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span className="font-medium text-foreground">{p.rating}</span>
                  <span className="text-muted-foreground">({p.reviewsCount})</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">${p.offerPrice.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground line-through">${p.price.toFixed(2)}</span>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-lg gap-1 text-xs"
                    onClick={() => {
                      addItem({
                        id: p.id,
                        name: p.name,
                        slug: p.slug,
                        image: p.image,
                        price: p.offerPrice,
                        qty: 1,
                        variantTotal: 0,
                      });
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="mt-auto border-t border-border bg-card py-12">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>NEXUSCOMMERCE</span>
          </div>
          <p>© 2026 Nexus Commerce Platform. Built with Next.js, Node.js, PostgreSQL & shadcn/ui.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/vendor/apply" className="hover:text-foreground">Merchant Agreement</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
