import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting PostgreSQL database seed...");

  // Default hashed password (placeholder for "password" in bcrypt)
  const defaultPasswordHash =
    "$2a$12$eX8mJb.Lw4kHkWv0Zp6q.O4Y1W/gO8o2eN9F3p8I1J7g5q0u1dK3G";

  // 1. Seed Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      name: "Super Administrator",
      email: "admin@gmail.com",
      password: defaultPasswordHash,
      role: Role.ADMIN,
      status: true,
      phone: "+1234567890",
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // 2. Seed Vendor User & Shop
  const vendorUser = await prisma.user.upsert({
    where: { email: "vendor@gmail.com" },
    update: {},
    create: {
      name: "Vendor Merchant",
      email: "vendor@gmail.com",
      password: defaultPasswordHash,
      role: Role.VENDOR,
      status: true,
      phone: "+1987654321",
    },
  });

  const vendorShop = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      shopName: "Apex Electronics & Lifestyle",
      email: "vendor@gmail.com",
      phone: "+1987654321",
      address: "123 Marketplace Way, San Francisco, CA",
      description: "Official authorized dealer of premium gadgets and accessories.",
      status: true, // Approved
    },
  });
  console.log(`✅ Vendor & Shop created: ${vendorShop.shopName}`);

  // 3. Seed Customer User
  const customer = await prisma.user.upsert({
    where: { email: "user@gmail.com" },
    update: {},
    create: {
      name: "John Shopper",
      email: "user@gmail.com",
      password: defaultPasswordHash,
      role: Role.USER,
      status: true,
      phone: "+1122334455",
    },
  });
  console.log(`✅ Customer created: ${customer.email}`);

  // 4. Seed Root Categories & Subcategories
  const electronicsCategory = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Electronics & Gadgets",
      slug: "electronics",
      icon: "laptop",
      status: true,
    },
  });

  const subCategoryLaptops = await prisma.subCategory.upsert({
    where: { slug: "laptops-computers" },
    update: {},
    create: {
      categoryId: electronicsCategory.id,
      name: "Laptops & Computers",
      slug: "laptops-computers",
      status: true,
    },
  });

  await prisma.childCategory.upsert({
    where: { slug: "gaming-laptops" },
    update: {},
    create: {
      subCategoryId: subCategoryLaptops.id,
      name: "Gaming Laptops",
      slug: "gaming-laptops",
      status: true,
    },
  });

  // 5. Seed Brands
  await prisma.brand.upsert({
    where: { slug: "apple" },
    update: {},
    create: {
      name: "Apple",
      slug: "apple",
      isFeatured: true,
      status: true,
    },
  });

  await prisma.brand.upsert({
    where: { slug: "samsung" },
    update: {},
    create: {
      name: "Samsung",
      slug: "samsung",
      isFeatured: true,
      status: true,
    },
  });

  // 6. Seed Withdrawal Methods
  await prisma.withdrawMethod.createMany({
    data: [
      {
        name: "Direct Bank Wire Transfer",
        minimumAmount: 100,
        maximumAmount: 10000,
        withdrawChargePercent: 2.5,
        description: "Direct wire to your corporate checking account. Processing takes 2-3 business days.",
        status: true,
      },
      {
        name: "PayPal Merchant Payout",
        minimumAmount: 50,
        maximumAmount: 5000,
        withdrawChargePercent: 3.0,
        description: "Instant electronic deposit to your registered business PayPal account.",
        status: true,
      },
    ],
    skipDuplicates: true,
  });

  // 7. Seed Settings
  await prisma.generalSetting.createMany({
    data: [
      {
        siteName: "Multi-Vendor Commerce Hub",
        contactEmail: "support@marketplace.com",
        contactPhone: "+1 (800) 555-0199",
        currencyName: "USD",
        currencyIcon: "$",
        timeZone: "America/New_York",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.paypalSetting.createMany({
    data: [
      {
        status: true,
        mode: "sandbox",
        currencyName: "USD",
        currencyRate: 1.0,
        clientId: "mock_paypal_client_id",
        secretKey: "mock_paypal_secret_key",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.stripeSetting.createMany({
    data: [
      {
        status: true,
        currencyName: "USD",
        currencyRate: 1.0,
        clientId: "pk_test_mock_stripe_key",
        secretKey: "sk_test_mock_stripe_secret",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.razorpaySetting.createMany({
    data: [
      {
        status: true,
        currencyName: "INR",
        currencyRate: 83.5,
        razorpayKey: "rzp_test_mock_key",
        razorpaySecretKey: "rzp_mock_secret",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.codSetting.createMany({
    data: [{ status: true }],
    skipDuplicates: true,
  });

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
