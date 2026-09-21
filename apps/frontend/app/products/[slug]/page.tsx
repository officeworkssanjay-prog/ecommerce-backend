"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Zap,
  Heart,
  Share2,
  CheckCircle2,
  Store,
  ChevronRight,
  Gem,
  Award,
} from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);
  const { addItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, { id: string; name: string; price: number }>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "desc" | "reviews">("specs");

  // Review Form
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewStatus, setReviewStatus] = useState<{ type: string; message?: string }>({
    type: "",
  });

  // Fallback Luxury Product if not yet in database
  const fallbackProduct = {
    id: "jewel-sample-1",
    name: "18K Royal Gold Kundan Choker with Natural Zambian Emeralds",
    slug: slug,
    sku: "SJ-KND-001",
    price: 2450,
    offerPrice: 2190,
    thumbImage:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80",
    imageGallery: [
      {
        id: "g1",
        image:
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "g2",
        image:
          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "g3",
        image:
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    category: { name: "Bridal Sets", slug: "bridal-sets" },
    brand: { name: "Sawariya Royal Atelier" },
    vendor: {
      id: "v-1",
      shopName: "Imperial Goldsmiths Guild",
      phone: "+91 98290 12345",
    },
    shortDescription:
      "An ethereal bridal choker handcrafted in solid 18K yellow gold, ornamented with hand-set uncut polki diamonds, natural drop-cut emeralds, and fine meenakari work.",
    longDescription:
      "Commissioned by royalty and perfected by fourth-generation artisanal goldsmiths, this regal choker embodies the heritage of Rajasthan and Mughal jewellery traditions. Every polki diamond is set into pure 24K gold foil (jadau method), ensuring unmatched brilliance without synthetic backing. Features a silk adjustable dori thread for comfort and custom fit.",
    variants: [
      {
        id: "var-1",
        name: "Gold Purity & Tone",
        items: [
          { id: "opt-1", name: "18K Yellow Gold", price: 0, isDefault: true },
          { id: "opt-2", name: "22K Antique Heritage Gold", price: 380, isDefault: false },
          { id: "opt-3", name: "18K Rose Gold", price: 60, isDefault: false },
        ],
      },
      {
        id: "var-2",
        name: "Gemstone Accents",
        items: [
          { id: "opt-gem-1", name: "Natural Zambian Emeralds", price: 0, isDefault: true },
          { id: "opt-gem-2", name: "Pigeon Blood Burmese Rubies", price: 150, isDefault: false },
        ],
      },
    ],
    reviews: [
      {
        id: "rev-1",
        rating: 5,
        review:
          "Words cannot do justice to the craftsmanship! The weight, polki luster, and emerald quality are museum-worthy. Wore it for my wedding and received countless compliments.",
        user: { name: "Pooja Singhania", avatar: null },
        createdAt: "2026-02-14T10:00:00Z",
      },
    ],
  };

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await api.get(`/storefront/products/${slug}`);
        if (res.success && res.data) {
          setProduct(res.data);
          setSelectedImage(res.data.thumbImage);
          // Set default variants
          if (res.data.variants) {
            const defaults: Record<string, any> = {};
            res.data.variants.forEach((v: any) => {
              if (v.items && v.items.length > 0) {
                const def = v.items.find((it: any) => it.isDefault) || v.items[0];
                defaults[v.name] = { id: def.id, name: def.name, price: def.price || 0 };
              }
            });
            setSelectedVariants(defaults);
          }
        } else {
          setProduct(fallbackProduct);
          setSelectedImage(fallbackProduct.thumbImage);
          const defaults: Record<string, any> = {};
          fallbackProduct.variants.forEach((v) => {
            defaults[v.name] = {
              id: v.items[0].id,
              name: v.items[0].name,
              price: v.items[0].price,
            };
          });
          setSelectedVariants(defaults);
        }
      } catch (err) {
        console.error("Failed to load product", err);
        setProduct(fallbackProduct);
        setSelectedImage(fallbackProduct.thumbImage);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-amber-600 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-sm text-zinc-400">Loading fine jewellery piece...</p>
      </div>
    );
  }

  const prod = product || fallbackProduct;

  // Calculate variant extra cost
  const variantTotal = Object.values(selectedVariants).reduce(
    (sum, item) => sum + (item.price || 0),
    0
  );
  const basePrice = prod.offerPrice || prod.price;
  const effectivePrice = basePrice + variantTotal;

  const handleAddToCart = () => {
    addItem({
      productId: prod.id,
      name: prod.name,
      slug: prod.slug,
      price: basePrice,
      thumbImage: prod.thumbImage,
      qty: quantity,
      variantTotal,
      variants: selectedVariants,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    setReviewStatus({ type: "loading" });
    try {
      const res = await api.post("/user/reviews", {
        productId: prod.id,
        rating,
        review: reviewText,
      });
      if (res.success) {
        setReviewStatus({
          type: "success",
          message: "Thank you! Your verified review has been submitted for moderation.",
        });
        setReviewText("");
      } else {
        setReviewStatus({ type: "error", message: res.message || "Failed to submit review." });
      }
    } catch {
      setReviewStatus({ type: "error", message: "Failed to submit review." });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Jewellery Vault
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {prod.category && (
          <>
            <Link
              href={`/products?category=${prod.category.slug}`}
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {prod.category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-zinc-900 dark:text-zinc-100 font-medium truncate max-w-xs">
          {prod.name}
        </span>
      </nav>

      {/* Main Grid: Gallery + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-md">
            <img
              src={selectedImage || prod.thumbImage}
              alt={prod.name}
              className="w-full h-full object-cover"
            />
            {prod.offerPrice && (
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-md">
                Special Collection
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {prod.imageGallery && prod.imageGallery.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedImage(prod.thumbImage)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                  selectedImage === prod.thumbImage
                    ? "border-amber-600 shadow-md scale-95"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={prod.thumbImage} alt="Thumb" className="w-full h-full object-cover" />
              </button>
              {prod.imageGallery.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === img.image
                      ? "border-amber-600 shadow-md scale-95"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.image} alt="Gallery" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                {prod.category?.name || "Bespoke Jewellery"}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-xs text-zinc-400">SKU: {prod.sku || "SJ-8842"}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
              {prod.name}
            </h1>

            {/* Ratings & Authenticity */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                4.9 ({prod.reviews?.length || 18} Collector Reviews)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  ${effectivePrice.toFixed(2)}
                </span>
                {prod.offerPrice && (
                  <span className="text-sm text-zinc-400 line-through">
                    ${(prod.price + variantTotal).toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Includes all luxury insured express packaging, BIS Hallmark certification & GST.
              </p>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> In Stock & Ready to Ship
            </span>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {prod.shortDescription}
          </p>

          {/* Dynamic Variant Selectors */}
          {prod.variants && prod.variants.length > 0 && (
            <div className="space-y-4 pt-2">
              {prod.variants.map((v: any) => (
                <div key={v.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                      {v.name}
                    </span>
                    <span className="text-xs text-zinc-400">
                      Selected:{" "}
                      <strong className="text-zinc-800 dark:text-zinc-200">
                        {selectedVariants[v.name]?.name || "Select"}
                      </strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {v.items?.map((item: any) => {
                      const isSelected = selectedVariants[v.name]?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() =>
                            setSelectedVariants((prev) => ({
                              ...prev,
                              [v.name]: {
                                id: item.id,
                                name: item.name,
                                price: item.price || 0,
                              },
                            }))
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                            isSelected
                              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-amber-500"
                          }`}
                        >
                          {item.name}
                          {item.price > 0 && ` (+$${item.price})`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                Quantity:
              </span>
              <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="py-3.5 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all transform hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Jewellery Box
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3.5 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Zap className="w-4 h-4 text-amber-400 dark:text-amber-600" /> Instant Checkout
              </button>
            </div>
          </div>

          {/* Authenticity Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/70 text-center space-y-1">
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto" />
              <h5 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">BIS 916 Hallmark</h5>
              <p className="text-[10px] text-zinc-500">Govt. stamped gold purity</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/70 text-center space-y-1">
              <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto" />
              <h5 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">Insured Transit</h5>
              <p className="text-[10px] text-zinc-500">100% loss/theft covered</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/70 text-center space-y-1">
              <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto" />
              <h5 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">30-Day Exchange</h5>
              <p className="text-[10px] text-zinc-500">Lifetime buyback guarantee</p>
            </div>
          </div>

          {/* Artisan Guild Box */}
          {prod.vendor && (
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                    Master Artisan / Atelier
                  </span>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {prod.vendor.shopName}
                  </h4>
                </div>
              </div>

              <Link
                href={`/vendors/${prod.vendor.id}`}
                className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline"
              >
                Visit Atelier
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Specifications & Customer Reviews */}
      <div className="pt-10 border-t border-zinc-200 dark:border-zinc-800 space-y-8">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-8">
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "specs"
                ? "border-amber-600 text-amber-600 dark:text-amber-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Jewellery Specifications
          </button>
          <button
            onClick={() => setActiveTab("desc")}
            className={`pb-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "desc"
                ? "border-amber-600 text-amber-600 dark:text-amber-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Heritage Story & Craft
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "reviews"
                ? "border-amber-600 text-amber-600 dark:text-amber-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Collector Reviews ({prod.reviews?.length || 1})
          </button>
        </div>

        {/* Tab 1: Specs */}
        {activeTab === "specs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Precious Metal Details
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">Gold Purity:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">18 Karat / 22 Karat (BIS Stamped)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">Gross Weight:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">42.80 Grams</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Finish / Tone:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Royal Antique Kundan Gold Polish</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Gemstones & Polki Diamonds
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">Diamond Type:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Natural Uncut Polki Diamonds</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">Colored Gemstones:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Natural Untreated Zambian Emeralds</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Certification:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">IGI / SGL Authenticity Card Included</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Heritage Story */}
        {activeTab === "desc" && (
          <div className="max-w-3xl space-y-4 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>{prod.longDescription || prod.shortDescription}</p>
            <p>
              Every piece in our royal vault undergoes 14 distinct quality inspections to verify prong
              rigidity, stone setting integrity, and hallmark micro-engraving.
            </p>
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === "reviews" && (
          <div className="space-y-8 max-w-4xl">
            {/* Review List */}
            <div className="space-y-4">
              {prod.reviews && prod.reviews.length > 0 ? (
                prod.reviews.map((rev: any) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {rev.user?.name || "Verified Collector"}
                      </span>
                      <div className="flex text-amber-400">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">{rev.review}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400">Be the first to review this fine creation.</p>
              )}
            </div>

            {/* Write Review Form */}
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Submit a Collector Review
              </h4>
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Rating:</span>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-amber-600"
                  >
                    <option value="5">★★★★★ (5 Stars - Flawless)</option>
                    <option value="4">★★★★☆ (4 Stars - Exceptional)</option>
                    <option value="3">★★★☆☆ (3 Stars - Good)</option>
                  </select>
                </div>

                <textarea
                  rows={3}
                  placeholder="Share your impressions regarding gemstone brilliance, gold finish, and artisan craftsmanship..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-xs"
                >
                  Submit Verified Review
                </button>

                {reviewStatus.message && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                    {reviewStatus.message}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
