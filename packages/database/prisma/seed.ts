import { PrismaClient, Role, ProductType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Sawariya Jewels database seed...");

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash("admin123", salt);
  const userPasswordHash = await bcrypt.hash("user123", salt);

  // 1. Seed Admin
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

  // 2. Seed Customer User
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

  // 3. Seed Address for Customer
  await prisma.userAddress.createMany({
    data: [
      {
        userId: customer.id,
        name: "Pooja Singhania",
        email: "collector@gmail.com",
        phone: "+91 98290 33333",
        country: "India",
        state: "Rajasthan",
        city: "Jaipur",
        zipCode: "302001",
        address: "74, Malviya Nagar Heritage Enclave",
        addressType: "home",
        isDefault: true,
      },
    ],
    skipDuplicates: true,
  });

  // 4. Seed Hero Sliders
  await prisma.slider.createMany({
    data: [
      {
        banner:
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80",
        type: "Bridal Couture Collection",
        title: "Royal Heritage Kundan & Polki Sets",
        startingPrice: 1250,
        btnUrl: "/products",
        serial: 1,
        status: true,
      },
      {
        banner:
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1600&q=80",
        type: "Certified Diamonds",
        title: "Certified Solitaire Diamond Rings",
        startingPrice: 890,
        btnUrl: "/products",
        serial: 2,
        status: true,
      },
      {
        banner:
          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80",
        type: "Antique Temple Gold",
        title: "22K Solid Gold Handcrafted Bangles",
        startingPrice: 1450,
        btnUrl: "/products",
        serial: 3,
        status: true,
      },
    ],
    skipDuplicates: true,
  });

  // 5. Seed Categories
  const catBridal = await prisma.category.upsert({
    where: { slug: "bridal-sets" },
    update: {},
    create: {
      name: "Bridal Sets",
      slug: "bridal-sets",
      icon: "crown",
      status: true,
    },
  });

  const catRings = await prisma.category.upsert({
    where: { slug: "diamond-rings" },
    update: {},
    create: {
      name: "Diamond Rings",
      slug: "diamond-rings",
      icon: "ring",
      status: true,
    },
  });

  const catNecklaces = await prisma.category.upsert({
    where: { slug: "gold-necklaces" },
    update: {},
    create: {
      name: "Gold Necklaces",
      slug: "gold-necklaces",
      icon: "sparkles",
      status: true,
    },
  });

  const catPolki = await prisma.category.upsert({
    where: { slug: "polki-jhumkas" },
    update: {},
    create: {
      name: "Polki & Jhumkas",
      slug: "polki-jhumkas",
      icon: "gem",
      status: true,
    },
  });

  const catBangles = await prisma.category.upsert({
    where: { slug: "bangles-kadas" },
    update: {},
    create: {
      name: "Bangles & Kadas",
      slug: "bangles-kadas",
      icon: "circle",
      status: true,
    },
  });

  const catGemstones = await prisma.category.upsert({
    where: { slug: "gemstone-pendants" },
    update: {},
    create: {
      name: "Gemstone Pendants",
      slug: "gemstone-pendants",
      icon: "sparkle",
      status: true,
    },
  });

  // 6. Seed Subcategories
  const subJadau = await prisma.subCategory.upsert({
    where: { slug: "jadau-chokers" },
    update: {},
    create: {
      categoryId: catBridal.id,
      name: "Jadau Chokers",
      slug: "jadau-chokers",
      status: true,
    },
  });

  const subSolitaires = await prisma.subCategory.upsert({
    where: { slug: "solitaire-engagement" },
    update: {},
    create: {
      categoryId: catRings.id,
      name: "Solitaire Engagement Rings",
      slug: "solitaire-engagement",
      status: true,
    },
  });

  // 7. Seed Brands
  const brandRoyal = await prisma.brand.upsert({
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

  const brandSurat = await prisma.brand.upsert({
    where: { slug: "surat-diamond-guild" },
    update: {},
    create: {
      name: "Surat Diamond Guild",
      slug: "surat-diamond-guild",
      isFeatured: true,
      status: true,
      logo: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200",
    },
  });

  // 8. Seed Jewellery Products
  const prod1 = await prisma.product.upsert({
    where: { slug: "royal-kundan-pendant-choker" },
    update: {},
    create: {
      name: "18K Gold Royal Kundan Pendant Choker",
      slug: "royal-kundan-pendant-choker",
      thumbImage: "/images/figma/bestseller-1.png",
      categoryId: catBridal.id,
      subCategoryId: subJadau.id,
      brandId: brandRoyal.id,
      qty: 5,
      shortDescription:
        "An ethereal bridal choker handcrafted in solid 18K yellow gold with natural uncut polki diamonds, hand-carved emerald beads, and silk adjustable dori.",
      longDescription:
        "Commissioned by royalty and perfected by fourth-generation artisanal goldsmiths, this regal choker embodies the heritage of Rajasthan and Mughal jewellery traditions. Every polki diamond is set into pure 24K gold foil (jadau method), ensuring unmatched brilliance without synthetic backing.",
      videoLink: "",
      sku: "SJ-KND-001",
      price: 2450,
      offerPrice: 2190,
      offerStartDate: new Date("2026-01-01"),
      offerEndDate: new Date("2026-12-31"),
      productType: ProductType.FEATURED_PRODUCT,
      status: true,
    },
  });

  // Variants for Product 1
  const varGold = await prisma.productVariant.create({
    data: {
      productId: prod1.id,
      name: "Gold Purity & Tone",
      status: true,
      items: {
        create: [
          { name: "18K Yellow Gold", price: 0, isDefault: true, status: true },
          { name: "22K Antique Heritage Gold", price: 380, isDefault: false, status: true },
          { name: "18K Rose Gold", price: 60, isDefault: false, status: true },
        ],
      },
    },
  });

  const varStone = await prisma.productVariant.create({
    data: {
      productId: prod1.id,
      name: "Gemstone Accents",
      status: true,
      items: {
        create: [
          { name: "Natural Zambian Emeralds", price: 0, isDefault: true, status: true },
          { name: "Pigeon Blood Burmese Rubies", price: 150, isDefault: false, status: true },
        ],
      },
    },
  });

  // Product 2: Solitaire Diamond Ring
  await prisma.product.upsert({
    where: { slug: "solitaire-diamond-ring-platinum-band" },
    update: {},
    create: {
      name: "1.50 Ct VVS1 Solitaire Diamond Ring in Platinum",
      slug: "solitaire-diamond-ring-platinum-band",
      thumbImage: "/images/figma/bestseller-4.png",
      categoryId: catRings.id,
      subCategoryId: subSolitaires.id,
      brandId: brandSurat.id,
      qty: 8,
      shortDescription:
        "GIA certified conflict-free solitaire diamond mounted on a 950 pure platinum cathedral setting with hidden diamond halo.",
      longDescription:
        "Individually hand-cut by master lapidaries in Surat, this 1.50 carat brilliant round diamond possesses excellent polish and symmetry. Accompanied by laser GIA inscription and velvet presentation vault box.",
      sku: "SJ-DIA-102",
      price: 3800,
      offerPrice: 3450,
      productType: ProductType.NEW_ARRIVAL,
      status: true,
    },
  });

  // Product 3: 22K Solid Gold Bangles
  await prisma.product.upsert({
    where: { slug: "antique-nakshi-temple-gold-bangles" },
    update: {},
    create: {
      name: "22K Solid Gold Antique Temple Nakshi Bangles (Pair)",
      slug: "antique-nakshi-temple-gold-bangles",
      thumbImage: "/images/figma/bestseller-3.png",
      categoryId: catBangles.id,
      brandId: brandRoyal.id,
      qty: 4,
      shortDescription:
        "Traditional South Indian temple design handcrafted by master goldsmiths featuring Lakshmi and peacock relief work in 22K gold.",
      sku: "SJ-GLD-203",
      price: 1950,
      offerPrice: 1750,
      productType: ProductType.BEST_PRODUCT,
      status: true,
    },
  });

  // Product 4: Polki Jhumkas
  await prisma.product.upsert({
    where: { slug: "heritage-polki-chandbali-jhumkas" },
    update: {},
    create: {
      name: "Heritage Uncut Diamond Polki Chandbali Jhumkas",
      slug: "heritage-polki-chandbali-jhumkas",
      thumbImage: "/images/figma/bestseller-2.png",
      categoryId: catPolki.id,
      brandId: brandRoyal.id,
      qty: 6,
      shortDescription:
        "Royal Jaipur polki work with freshwater south sea pearls and enamel meenakari detailing on the reverse.",
      sku: "SJ-JHM-304",
      price: 1350,
      offerPrice: 1190,
      productType: ProductType.TOP_PRODUCT,
      status: true,
    },
  });

  // 9. Seed Flash Sale Event
  const flashSale = await prisma.flashSale.upsert({
    where: { id: "main-flash-sale" },
    update: {},
    create: {
      id: "main-flash-sale",
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      showAtHome: true,
      products: {
        create: [
          {
            productId: prod1.id,
            showAtHome: true,
            status: true,
          },
        ],
      },
    },
  });

  // 10. Seed Shipping Rules
  await prisma.shippingRule.createMany({
    data: [
      {
        name: "Complimentary Insured Courier",
        type: "flat_cost",
        minCost: 0,
        cost: 0,
        status: true,
      },
      {
        name: "Armored Express Vault Courier",
        type: "flat_cost",
        minCost: 0,
        cost: 45,
        status: true,
      },
    ],
    skipDuplicates: true,
  });

  // 11. Seed Coupons
  await prisma.coupon.createMany({
    data: [
      {
        name: "Royal Heritage Welcome",
        code: "ROYAL10",
        quantity: 1000,
        maxUse: 1000,
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-12-31"),
        discountType: "PERCENT",
        discount: 10,
        status: true,
        totalUsed: 0,
      },
    ],
    skipDuplicates: true,
  });

  // 12. Seed General Settings
  await prisma.generalSetting.createMany({
    data: [
      {
        siteName: "Sawariya Jewels - Fine Handcrafted Jewellery",
        contactEmail: "concierge@sawariyajewels.com",
        contactPhone: "+91 98290 12345",
        currencyName: "USD",
        currencyIcon: "$",
        timeZone: "Asia/Kolkata",
      },
    ],
    skipDuplicates: true,
  });

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
