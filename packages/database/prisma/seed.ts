import { PrismaClient, Role, ProductType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Sample data for development. Idempotent: safe to run repeatedly. Catalogue structure and copy follow
 * the Figma design (8 categories, rupee prices, free shipping above 499, five hero slides).
 */

const IMG = "/images/figma";

const categories = [
  { slug: "bangles", name: "Bangles", icon: `${IMG}/cat-bangles.png`, subs: [["bangle-sets", "Bangle Sets"], ["kadas", "Kadas"], ["cuffs", "Cuffs"], ["openable", "Openable"], ["kids-bangles", "Kids"]] },
  { slug: "necklaces", name: "Necklaces", icon: `${IMG}/cat-necklaces.png`, subs: [["chokers", "Chokers"], ["pendants", "Pendants"], ["layered", "Layered"], ["long-necklaces", "Long"]] },
  { slug: "earrings", name: "Earrings", icon: `${IMG}/cat-earrings.png`, subs: [["jhumkas", "Jhumkas"], ["studs", "Studs"], ["hoops", "Hoops"], ["chandbalis", "Chandbalis"]] },
  { slug: "rings", name: "Rings", icon: `${IMG}/cat-rings.png`, subs: [["band-rings", "Bands"], ["solitaire-rings", "Solitaire Look"], ["statement-rings", "Statement"], ["adjustable-rings", "Adjustable"]] },
  { slug: "bridal-sets", name: "Bridal Sets", icon: `${IMG}/cat-bridal.png`, subs: [["jadau-chokers", "Jadau Chokers"], ["bridal-necklace-sets", "Necklace Sets"], ["maang-tikka", "Maang Tikka"]] },
  { slug: "anklets", name: "Anklets", icon: `${IMG}/cat-anklets.png`, subs: [["payal", "Payal"], ["single-anklets", "Single"], ["kids-anklets", "Kids"]] },
  // NOTE: the two images below are stand-ins until dedicated Mangalsutra / Bracelet photos exist.
  { slug: "mangalsutras", name: "Mangalsutras", icon: `${IMG}/cat-chains.png`, subs: [["short-mangalsutras", "Short"], ["long-mangalsutras", "Long"], ["mangalsutra-pendants", "Pendants"]] },
  { slug: "bracelets", name: "Bracelets", icon: `${IMG}/cat-nath-tikka.png`, subs: [["chain-bracelets", "Chain"], ["cuff-bracelets", "Cuff"], ["charm-bracelets", "Charm"]] },
] as const;

type Seed = {
  sku: string; slug: string; name: string; cat: string; sub: string; price: number; offer?: number; qty: number;
  type?: ProductType; image: string; short: string; sizes?: boolean;
};

const products: Seed[] = [
  { sku: "SJ-NCK-101", slug: "layered-gold-necklace", name: "Layered Gold Necklace", cat: "necklaces", sub: "layered", price: 3499, offer: 2499, qty: 14, type: ProductType.BEST_PRODUCT, image: `${IMG}/bestseller-1.png`, short: "Two delicate gold-tone layers with a solitaire-style drop. Light enough for every day." },
  { sku: "SJ-JHM-304", slug: "heritage-polki-chandbali-jhumkas", name: "Gold Jhumkas", cat: "earrings", sub: "jhumkas", price: 1799, offer: 1299, qty: 20, type: ProductType.NEW_ARRIVAL, image: `${IMG}/bestseller-2.png`, short: "Classic temple-style jhumkas with fine filigree and pearl drops." },
  { sku: "SJ-BNG-201", slug: "stacked-bangles", name: "Stacked Bangles", cat: "bangles", sub: "bangle-sets", price: 5499, offer: 3999, qty: 12, type: ProductType.BEST_PRODUCT, image: `${IMG}/bestseller-3.png`, short: "A set of four stackable gold-tone bangles, from everyday stacks to festive wear.", sizes: true },
  { sku: "SJ-DIA-102", slug: "solitaire-diamond-ring-platinum-band", name: "Gold Ring", cat: "rings", sub: "band-rings", price: 1299, offer: 999, qty: 25, type: ProductType.BEST_PRODUCT, image: `${IMG}/bestseller-4.png`, short: "A slim polished band with a hand-finished edge. Skin-safe, anti-tarnish finish." },
  { sku: "SJ-GLD-203", slug: "antique-nakshi-temple-gold-bangles", name: "Antique Temple Kadas", cat: "bangles", sub: "kadas", price: 2999, offer: 2499, qty: 10, type: ProductType.TOP_PRODUCT, image: `${IMG}/bestseller-3.png`, short: "Nakshi-work kadas with an antique gold finish, made for festive occasions.", sizes: true },
  { sku: "SJ-BNG-202", slug: "openable-cuff-bangle", name: "Openable Cuff Bangle", cat: "bangles", sub: "openable", price: 1999, qty: 16, image: `${IMG}/bestseller-3.png`, short: "An adjustable open cuff that fits most wrists.", sizes: true },
  { sku: "SJ-BNG-203", slug: "kids-bangle-set", name: "Kids Bangle Set", cat: "bangles", sub: "kids-bangles", price: 799, offer: 699, qty: 18, image: `${IMG}/bestseller-3.png`, short: "Soft-edged bangles in kid-friendly sizes.", sizes: true },
  { sku: "SJ-NCK-102", slug: "temple-choker", name: "Temple Choker", cat: "necklaces", sub: "chokers", price: 3499, offer: 2799, qty: 9, type: ProductType.FEATURED_PRODUCT, image: `${IMG}/bestseller-1.png`, short: "A close-fitting choker with temple motifs and a back dori." },
  { sku: "SJ-NCK-103", slug: "long-pearl-mala", name: "Long Pearl Mala", cat: "necklaces", sub: "long-necklaces", price: 1999, qty: 11, image: `${IMG}/bestseller-1.png`, short: "A long mala with lustrous faux pearls and gold-tone spacers." },
  { sku: "SJ-EAR-305", slug: "polki-chandbali-earrings", name: "Polki Chandbali Earrings", cat: "earrings", sub: "chandbalis", price: 2199, offer: 1799, qty: 13, type: ProductType.FEATURED_PRODUCT, image: `${IMG}/bestseller-2.png`, short: "Crescent chandbalis set with polki-look stones." },
  { sku: "SJ-EAR-306", slug: "pearl-drop-studs", name: "Pearl Drop Studs", cat: "earrings", sub: "studs", price: 899, qty: 30, type: ProductType.NEW_ARRIVAL, image: `${IMG}/bestseller-2.png`, short: "Minimal pearl studs for work and weekends." },
  { sku: "SJ-RNG-103", slug: "adjustable-statement-ring", name: "Adjustable Statement Ring", cat: "rings", sub: "adjustable-rings", price: 799, offer: 599, qty: 22, image: `${IMG}/bestseller-4.png`, short: "A bold cocktail ring with an adjustable back." },
  { sku: "SJ-KND-001", slug: "royal-kundan-pendant-choker", name: "Kundan Pendant Choker Set", cat: "bridal-sets", sub: "jadau-chokers", price: 5999, offer: 4999, qty: 8, type: ProductType.FEATURED_PRODUCT, image: `${IMG}/bestseller-1.png`, short: "A bridal kundan choker with matching earrings and an adjustable dori." },
  { sku: "SJ-BRD-401", slug: "bridal-maang-tikka", name: "Bridal Maang Tikka", cat: "bridal-sets", sub: "maang-tikka", price: 2999, offer: 2499, qty: 12, image: `${IMG}/bestseller-2.png`, short: "A kundan maang tikka with pearl drops for the big day." },
  { sku: "SJ-ANK-501", slug: "silver-look-payal-pair", name: "Payal Pair", cat: "anklets", sub: "payal", price: 1499, offer: 1199, qty: 24, image: `${IMG}/bestseller-4.png`, short: "A pair of anklets with soft ghungroo bells." },
  { sku: "SJ-MNG-601", slug: "black-bead-mangalsutra", name: "Black Bead Mangalsutra", cat: "mangalsutras", sub: "short-mangalsutras", price: 2499, offer: 1999, qty: 15, type: ProductType.TOP_PRODUCT, image: `${IMG}/bestseller-1.png`, short: "A short mangalsutra with black beads and a gold-tone pendant." },
  { sku: "SJ-BRC-701", slug: "charm-bracelet", name: "Charm Bracelet", cat: "bracelets", sub: "charm-bracelets", price: 1299, offer: 999, qty: 19, type: ProductType.NEW_ARRIVAL, image: `${IMG}/bestseller-3.png`, short: "A delicate chain bracelet with tiny gold-tone charms." },
];

const slides = [
  { banner: `${IMG}/hero.png`, type: "New Collection 2026", title: "Elegant Jewellery, Affordable Price", subtitle: "From weddings to daily wear, trending designs for every occasion.", btnUrl: "/products", serial: 1 },
  { banner: `${IMG}/bridal-banner.png`, type: "The Bridal Edit", title: "Every Ritual, Beautifully Adorned", subtitle: "Heirloom-inspired bridal sets for your big day.", btnUrl: "/products?category=bridal-sets", serial: 2 },
  { banner: `${IMG}/hero-slide-5.png`, type: "Festive Season", title: "Shine Bright This Festive Season", subtitle: "Statement jewellery for every celebration.", btnUrl: "/products?sale=true", serial: 3 },
  { banner: `${IMG}/occasion-everyday.png`, type: "Everyday Essentials", title: "Light, Lovely, Everyday", subtitle: "Minimal pieces for daily wear.", btnUrl: "/products?category=rings", serial: 4 },
  { banner: `${IMG}/curated-large.png`, type: "New Arrivals", title: "Curated for You", subtitle: "Fresh designs added every week.", btnUrl: "/products?sort=newest", serial: 5 },
];

async function main() {
  console.log("🌱 Starting Sawariya Jewels database seed...");

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash("admin123", salt);
  const userPasswordHash = await bcrypt.hash("user123", salt);

  // 1. Accounts
  const admin = await prisma.user.upsert({
    where: { email: "admin@sawariyajewels.com" },
    update: { password: adminPasswordHash },
    create: {
      name: "Master Jeweller & Admin",
      email: "admin@sawariyajewels.com",
      password: adminPasswordHash,
      role: Role.ADMIN,
      status: true,
      phone: "+91 98290 11111",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    },
  });
  console.log(`✅ Admin created: ${admin.email} (Password: admin123)`);

  const customer = await prisma.user.upsert({
    where: { email: "collector@gmail.com" },
    update: { password: userPasswordHash },
    create: {
      name: "Pooja Singhania",
      email: "collector@gmail.com",
      password: userPasswordHash,
      role: Role.USER,
      status: true,
      phone: "+91 98290 33333",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
    },
  });
  console.log(`✅ Customer created: ${customer.email} (Password: user123)`);

  const seedAddress = "74, Malviya Nagar Heritage Enclave";
  if (!(await prisma.userAddress.findFirst({ where: { userId: customer.id, address: seedAddress } }))) {
    await prisma.userAddress.create({
      data: {
        userId: customer.id,
        name: "Pooja Singhania",
        email: "collector@gmail.com",
        phone: "+91 98290 33333",
        country: "India",
        state: "Rajasthan",
        city: "Jaipur",
        zipCode: "302001",
        address: seedAddress,
        addressType: "home",
        isDefault: true,
      },
    });
  }

  // 2. Hero slides (matched by title; the superseded sample slides are removed)
  await prisma.slider.deleteMany({
    where: { title: { in: ["Royal Heritage Kundan & Polki Sets", "Certified Solitaire Diamond Rings", "22K Solid Gold Handcrafted Bangles"] } },
  });
  for (const s of slides) {
    const existing = await prisma.slider.findFirst({ where: { title: s.title } });
    if (existing) await prisma.slider.update({ where: { id: existing.id }, data: { ...s, status: true } });
    else await prisma.slider.create({ data: { ...s, status: true } });
  }

  // 3. Categories and sub-categories
  const catId = new Map<string, string>();
  const subId = new Map<string, string>();
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon, status: true },
      create: { slug: c.slug, name: c.name, icon: c.icon, status: true },
    });
    catId.set(c.slug, cat.id);
    for (const [slug, name] of c.subs) {
      const sub = await prisma.subCategory.upsert({
        where: { slug },
        update: { name, categoryId: cat.id, status: true },
        create: { slug, name, categoryId: cat.id, status: true },
      });
      subId.set(slug, sub.id);
    }
  }

  // 4. Brands
  const brand = await prisma.brand.upsert({
    where: { slug: "sawariya-royal-atelier" },
    update: {},
    create: {
      name: "Sawariya Royal Atelier",
      slug: "sawariya-royal-atelier",
      isFeatured: true,
      status: true,
      logo: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200",
    },
  });

  // 5. Products (existing ones are updated in place so older sample data converts to this catalogue)
  const productId = new Map<string, string>();
  for (const p of products) {
    const data = {
      name: p.name,
      thumbImage: p.image,
      categoryId: catId.get(p.cat)!,
      subCategoryId: subId.get(p.sub)!,
      brandId: brand.id,
      qty: undefined as number | undefined,
      shortDescription: p.short,
      longDescription: `${p.short} Handcrafted by our karigars with a skin-safe, anti-tarnish finish.`,
      sku: p.sku,
      price: p.price,
      offerPrice: p.offer ?? null,
      offerStartDate: p.offer ? new Date("2026-01-01") : null,
      offerEndDate: p.offer ? new Date("2027-12-31") : null,
      productType: p.type ?? null,
      status: true,
    };
    const { qty: _omit, ...updateData } = data; // keep live stock when re-seeding
    const saved = await prisma.product.upsert({
      where: { slug: p.slug },
      update: updateData,
      create: { ...updateData, slug: p.slug, qty: p.qty },
    });
    productId.set(p.sku, saved.id);

    // Options (created once per product)
    if ((await prisma.productVariant.count({ where: { productId: saved.id } })) === 0) {
      if (p.sizes) {
        await prisma.productVariant.create({
          data: {
            productId: saved.id,
            name: "Size",
            items: {
              create: [
                { name: "2.2", price: 0, isDefault: false },
                { name: "2.4", price: 0, isDefault: true },
                { name: "2.6", price: 0, isDefault: false },
                { name: "2.8", price: 0, isDefault: false },
              ],
            },
          },
        });
      } else if (p.sku === "SJ-KND-001") {
        await prisma.productVariant.create({
          data: {
            productId: saved.id,
            name: "Finish",
            items: {
              create: [
                { name: "Antique Gold", price: 0, isDefault: true },
                { name: "Rose Gold", price: 300, isDefault: false },
              ],
            },
          },
        });
      }
    }
  }

  // 6. Remove sample categories from the previous catalogue (their products now live in the new ones)
  await prisma.category.deleteMany({
    where: {
      slug: { in: ["diamond-rings", "gold-necklaces", "polki-jhumkas", "bangles-kadas", "gemstone-pendants"] },
      products: { none: {} },
    },
  });

  // 7. Festive sale (countdown on the home page)
  const flash = await prisma.flashSale.upsert({
    where: { id: "main-flash-sale" },
    update: { endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), showAtHome: true },
    create: { id: "main-flash-sale", endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), showAtHome: true },
  });
  for (const sku of ["SJ-KND-001", "SJ-BNG-201", "SJ-NCK-101"]) {
    await prisma.flashSaleProduct.upsert({
      where: { flashSaleId_productId: { flashSaleId: flash.id, productId: productId.get(sku)! } },
      update: {},
      create: { flashSaleId: flash.id, productId: productId.get(sku)!, showAtHome: true, status: true },
    });
  }

  // 8. Shipping: free above 499 (as announced in the store banner)
  await prisma.shippingRule.deleteMany({ where: { name: { in: ["Complimentary Insured Courier", "Armored Express Vault Courier"] } } });
  for (const r of [
    { name: "Standard Delivery", type: "flat_cost", minCost: 0, cost: 49 },
    { name: "Express Delivery", type: "flat_cost", minCost: 0, cost: 99 },
    { name: "Free Shipping (orders above 499)", type: "min_cost", minCost: 499, cost: 0 },
  ]) {
    await prisma.shippingRule.upsert({ where: { name: r.name }, update: r, create: { ...r, status: true } });
  }

  // 9. Coupons
  await prisma.coupon.createMany({
    data: [
      {
        name: "Welcome offer",
        code: "ROYAL10",
        quantity: 1000,
        maxUse: 1000,
        startDate: new Date("2026-01-01"),
        endDate: new Date("2027-12-31"),
        discountType: "PERCENT",
        discount: 10,
        status: true,
        totalUsed: 0,
      },
    ],
    skipDuplicates: true,
  });

  // 10. General settings: the store trades in rupees
  const general = await prisma.generalSetting.findFirst();
  const settings = {
    siteName: "Sawariya Jewels",
    contactEmail: "concierge@sawariyajewels.com",
    contactPhone: "+91 98290 12345",
    currencyName: "INR",
    currencyIcon: "₹",
    timeZone: "Asia/Kolkata",
  };
  if (general) await prisma.generalSetting.update({ where: { id: general.id }, data: settings });
  else await prisma.generalSetting.create({ data: settings });

  console.log("🎉 Sawariya Jewels database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
