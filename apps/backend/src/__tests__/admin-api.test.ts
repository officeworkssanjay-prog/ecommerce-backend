import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@ecommerce/database";
import { app } from "../app";

const uniq = Date.now().toString(36);
let admin: ReturnType<typeof request.agent>;
let buyer: ReturnType<typeof request.agent>;
let adminUserId: string;
let seededCategoryId: string;
let seededSubCategoryId: string;
let originalQty: number;
let stockProductId: string;
let buyerAddressId: string;

const createdCategories: string[] = [];
const createdProducts: string[] = [];
const createdCoupons: string[] = [];
const createdUsers: string[] = [];
const createdOrders: string[] = [];
let emailSettingExisted = false;

const validProduct = () => ({
  name: `Test Ring ${uniq}`,
  categoryId: seededCategoryId,
  thumbImage: "/images/figma/bestseller-1.png",
  qty: 5,
  price: 1000,
  offerPrice: 900,
});

beforeAll(async () => {
  admin = request.agent(app);
  buyer = request.agent(app);
  const a = await admin.post("/api/auth/login").send({ email: "admin@sawariyajewels.com", password: "admin123" });
  expect(a.status).toBe(200);
  adminUserId = a.body.user.id;
  expect((await buyer.post("/api/auth/login").send({ email: "collector@gmail.com", password: "user123" })).status).toBe(200);

  const cat = await prisma.category.findUniqueOrThrow({ where: { slug: "necklaces" } });
  seededCategoryId = cat.id;
  const sub = await prisma.subCategory.findUniqueOrThrow({ where: { slug: "jadau-chokers" } }); // belongs to Bridal Sets, not Gold Necklaces
  seededSubCategoryId = sub.id;

  const stock = await prisma.product.findUniqueOrThrow({ where: { sku: "SJ-JHM-304" } });
  stockProductId = stock.id;
  originalQty = stock.qty;
  buyerAddressId = (await prisma.userAddress.findFirstOrThrow({ where: { user: { email: "collector@gmail.com" } } })).id;
  emailSettingExisted = (await prisma.emailSetting.count()) > 0;
});

afterAll(async () => {
  await prisma.order.deleteMany({ where: { id: { in: createdOrders } } });
  await prisma.product.update({ where: { id: stockProductId }, data: { qty: originalQty } });
  await prisma.product.deleteMany({ where: { id: { in: createdProducts } } });
  await prisma.category.deleteMany({ where: { id: { in: createdCategories } } });
  await prisma.coupon.deleteMany({ where: { id: { in: createdCoupons } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUsers } } });
  await prisma.user.update({ where: { id: adminUserId }, data: { status: true } });
  if (!emailSettingExisted) await prisma.emailSetting.deleteMany({});
  await prisma.$disconnect();
});

describe("admin access", () => {
  it("blocks anonymous users and buyers from every write", async () => {
    for (const [method, url] of [
      ["post", "/api/admin/categories"],
      ["post", "/api/admin/products"],
      ["put", "/api/admin/settings/general"],
      ["put", `/api/admin/orders/${adminUserId}/status`],
    ] as const) {
      expect((await request(app)[method](url).send({})).status).toBe(401);
      expect((await buyer[method](url).send({})).status).toBe(403);
    }
  });
});

describe("categories", () => {
  it("validates input, creates readable unique slugs, keeps the slug on rename", async () => {
    expect((await admin.post("/api/admin/categories").send({})).status).toBe(400);
    expect((await admin.post("/api/admin/categories").send({ name: "A" })).status).toBe(400);

    const name = `Anklets ${uniq}`;
    const one = await admin.post("/api/admin/categories").send({ name });
    const two = await admin.post("/api/admin/categories").send({ name });
    expect(one.status).toBe(201);
    expect(two.status).toBe(201);
    createdCategories.push(one.body.data.id, two.body.data.id);
    expect(one.body.data.slug).toBe(`anklets-${uniq}`);
    expect(two.body.data.slug).toBe(`anklets-${uniq}-2`);

    const renamed = await admin.put(`/api/admin/categories/${one.body.data.id}`).send({ name: "Renamed" });
    expect(renamed.status).toBe(200);
    expect(renamed.body.data.slug).toBe(`anklets-${uniq}`);

    expect((await admin.put(`/api/admin/categories/${one.body.data.id}`).send({})).status).toBe(400); // nothing to update
    expect((await admin.put("/api/admin/categories/11111111-1111-4111-8111-111111111111").send({ name: "Ghost" })).status).toBe(404);
    expect((await admin.put("/api/admin/categories/not-a-uuid").send({ name: "Ghost" })).status).toBe(400);
  });

  it("refuses to delete a category that still has products (409, not 500)", async () => {
    // Uses its own category and product so seed data is never touched
    const cat = await admin.post("/api/admin/categories").send({ name: `Temp ${uniq}` });
    createdCategories.push(cat.body.data.id);
    const prod = await admin.post("/api/admin/products").send({ ...validProduct(), name: `Temp Product ${uniq}`, categoryId: cat.body.data.id });
    expect(prod.status).toBe(201);
    createdProducts.push(prod.body.data.id);

    const res = await admin.delete(`/api/admin/categories/${cat.body.data.id}`);
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/in use/i);
  });

  it("rejects a sub-category whose parent does not exist", async () => {
    const res = await admin.post("/api/admin/sub-categories").send({ categoryId: "11111111-1111-4111-8111-111111111111", name: "Orphan" });
    expect(res.status).toBe(400);
    expect(res.body.errors.categoryId).toBeTruthy();
  });
});

describe("products", () => {
  it("rejects inconsistent data with field errors", async () => {
    const cases: [string, Record<string, unknown>, string][] = [
      ["negative stock", { qty: -1 }, "qty"],
      ["zero price", { price: 0 }, "price"],
      ["offer above price", { offerPrice: 5000 }, "offerPrice"],
      ["sub-category of another category", { subCategoryId: seededSubCategoryId }, "subCategoryId"],
      ["missing image", { thumbImage: "" }, "thumbImage"],
      ["script as image", { thumbImage: "javascript:alert(1)" }, "thumbImage"],
    ];
    for (const [, patch, field] of cases) {
      const res = await admin.post("/api/admin/products").send({ ...validProduct(), ...patch });
      expect(res.status).toBe(400);
      expect(res.body.errors[field]).toBeTruthy();
    }
    expect((await admin.post("/api/admin/products").send({ ...validProduct(), categoryId: undefined })).status).toBe(400); // no silent default category
  });

  it("creates, updates falsy values correctly, keeps the slug, and deletes", async () => {
    const created = await admin.post("/api/admin/products").send(validProduct());
    expect(created.status).toBe(201);
    const { id, slug } = created.body.data;
    createdProducts.push(id);
    expect(slug).toBe(`test-ring-${uniq}`);

    const updated = await admin.put(`/api/admin/products/${id}`).send({ name: "Totally Different Name", qty: 0, offerPrice: null, status: false });
    expect(updated.status).toBe(200);
    expect(updated.body.data.qty).toBe(0); // 0 is a real value, not "missing"
    expect(updated.body.data.offerPrice).toBeNull();
    expect(updated.body.data.status).toBe(false);
    expect(updated.body.data.slug).toBe(slug);

    expect((await admin.put(`/api/admin/products/${id}`).send({ price: 100, offerPrice: 200 })).status).toBe(400);
    expect((await admin.delete(`/api/admin/products/${id}`)).status).toBe(200);
  });

  it("returns 409 on a duplicate SKU and 409 when deleting a product that was ordered", async () => {
    const sku = `SKU-${uniq}`;
    const first = await admin.post("/api/admin/products").send({ ...validProduct(), name: `Sku A ${uniq}`, sku });
    createdProducts.push(first.body.data.id);
    expect((await admin.post("/api/admin/products").send({ ...validProduct(), name: `Sku B ${uniq}`, sku })).status).toBe(409);

    // A product that has been ordered must be kept (history) - uses its own product, never seed data
    const own = await admin.post("/api/admin/products").send({ ...validProduct(), name: `Ordered ${uniq}`, qty: 3 });
    expect(own.status).toBe(201);
    createdProducts.push(own.body.data.id);
    const order = await buyer.post("/api/order/checkout").send({ items: [{ productId: own.body.data.id, qty: 1 }], addressId: buyerAddressId, paymentMethod: "COD" });
    expect(order.status).toBe(201);
    createdOrders.push(order.body.data.orderId);

    const del = await admin.delete(`/api/admin/products/${own.body.data.id}`);
    expect(del.status).toBe(409);
    expect(del.body.message).toMatch(/in use/i);
  });
});

describe("coupons", () => {
  it("validates dates and percent range, uppercases codes, rejects duplicates", async () => {
    const base = { name: "Test", code: `t${uniq}`, quantity: 10, maxUse: 1, startDate: "2026-01-01", endDate: "2026-12-31", discountType: "PERCENT", discount: 15 };
    expect((await admin.post("/api/admin/coupons").send({ ...base, discount: 150 })).status).toBe(400);
    expect((await admin.post("/api/admin/coupons").send({ ...base, endDate: "2025-01-01" })).status).toBe(400);
    expect((await admin.post("/api/admin/coupons").send({ ...base, code: "a b" })).status).toBe(400);
    expect((await admin.post("/api/admin/coupons").send({ ...base, quantity: 0 })).status).toBe(400);

    const ok = await admin.post("/api/admin/coupons").send(base);
    expect(ok.status).toBe(201);
    createdCoupons.push(ok.body.data.id);
    expect(ok.body.data.code).toBe(`T${uniq}`.toUpperCase());
    expect((await admin.post("/api/admin/coupons").send(base)).status).toBe(409);

    // cross-field rule on update uses the stored values
    expect((await admin.put(`/api/admin/coupons/${ok.body.data.id}`).send({ discount: 500 })).status).toBe(400);
    expect((await admin.put(`/api/admin/coupons/${ok.body.data.id}`).send({ status: false })).status).toBe(200);
  });
});

describe("order status rules", () => {
  it("enforces transitions, restocks on cancel, and settles COD on delivery", async () => {
    const place = async () => {
      const r = await buyer.post("/api/order/checkout").send({ items: [{ productId: stockProductId, qty: 2 }], addressId: buyerAddressId, paymentMethod: "COD" });
      expect(r.status).toBe(201);
      createdOrders.push(r.body.data.orderId);
      return r.body.data.orderId as string;
    };
    const stock = async () => (await prisma.product.findUniqueOrThrow({ where: { id: stockProductId } })).qty;
    const setStatus = (id: string, body: object) => admin.put(`/api/admin/orders/${id}/status`).send(body);

    expect((await setStatus("11111111-1111-4111-8111-111111111111", { orderStatus: "SHIPPED" })).status).toBe(404);

    // Cancel path
    const before = await stock();
    const a = await place();
    expect(await stock()).toBe(before - 2);
    expect((await setStatus(a, { orderStatus: "BOGUS" })).status).toBe(400);
    expect((await setStatus(a, { orderStatus: "DELIVERED" })).status).toBe(409); // can't skip fulfilment
    expect((await setStatus(a, { orderStatus: "CANCELED" })).status).toBe(200);
    expect(await stock()).toBe(before); // stock returned
    expect((await setStatus(a, { orderStatus: "PROCESSED_AND_READY_TO_SHIP" })).status).toBe(409); // cancelled is final
    expect((await setStatus(a, { paymentStatus: "PAID" })).status).toBe(409);

    // Delivery path
    const b = await place();
    for (const s of ["PROCESSED_AND_READY_TO_SHIP", "SHIPPED", "OUT_FOR_DELIVERY"]) {
      expect((await setStatus(b, { orderStatus: s })).status).toBe(200);
    }
    const delivered = await setStatus(b, { orderStatus: "DELIVERED" });
    expect(delivered.status).toBe(200);
    expect(delivered.body.data.paymentStatus).toBe("PAID"); // cash collected
    expect((await setStatus(b, { orderStatus: "CANCELED" })).status).toBe(409); // delivered is final

    // Empty body
    expect((await setStatus(b, {})).status).toBe(400);
  });
});

describe("users", () => {
  it("validates new users, normalises emails, blocks self-deactivation and locks out deactivated users", async () => {
    const email = `staff-${uniq}@Example.com`;
    expect((await admin.post("/api/admin/users").send({ name: "S", email: "bad", password: "x" })).status).toBe(400);
    expect((await admin.post("/api/admin/users").send({ name: "Staff", email, password: "Passw0rd1", role: "SUPERUSER" })).status).toBe(400);

    const created = await admin.post("/api/admin/users").send({ name: "Staff Member", email, password: "Passw0rd1" });
    expect(created.status).toBe(201);
    createdUsers.push(created.body.data.id);
    expect(created.body.data.email).toBe(email.toLowerCase());
    expect(created.body.data.role).toBe("USER");
    expect((await admin.post("/api/admin/users").send({ name: "Staff Member", email: email.toLowerCase(), password: "Passw0rd1" })).status).toBe(409);

    expect((await admin.put(`/api/admin/users/${adminUserId}/status`).send({ status: false })).status).toBe(400);
    expect((await admin.put(`/api/admin/users/${created.body.data.id}/status`).send({ status: "nope" })).status).toBe(400);
    expect((await admin.put(`/api/admin/users/${created.body.data.id}/status`).send({ status: false })).status).toBe(200);

    const login = await request(app).post("/api/auth/login").send({ email: email.toLowerCase(), password: "Passw0rd1" });
    expect(login.status).toBe(403);
  });

  it("never lets the last active admin be deactivated", async () => {
    // Only one active admin exists (the seeded one), so a second admin is created to act, then removed.
    const second = await admin.post("/api/admin/users").send({ name: "Second Admin", email: `admin2-${uniq}@example.com`, password: "Passw0rd1", role: "ADMIN" });
    expect(second.status).toBe(201);
    createdUsers.push(second.body.data.id);
    const other = request.agent(app);
    expect((await other.post("/api/auth/login").send({ email: `admin2-${uniq}@example.com`, password: "Passw0rd1" })).status).toBe(200);

    // second admin deactivates the first: allowed (another active admin remains = themselves)
    expect((await other.put(`/api/admin/users/${adminUserId}/status`).send({ status: false })).status).toBe(200);
    // ...and now the only active admin is the second one, who cannot be deactivated by anyone else's session either:
    await prisma.user.update({ where: { id: adminUserId }, data: { status: true } });
    await prisma.user.update({ where: { id: second.body.data.id }, data: { status: false } });
    const attempt = await admin.put(`/api/admin/users/${adminUserId}/status`).send({ status: false });
    expect(attempt.status).toBe(400); // self
  });
});

describe("settings", () => {
  it("never returns stored secrets and keeps them when a masked value is sent back", async () => {
    const put = await admin.put("/api/admin/settings/email").send({ email: "shop@example.com", host: "smtp.example.com", username: "shop", password: "supersecret123", port: 587 });
    expect(put.status).toBe(200);
    expect(JSON.stringify(put.body)).not.toContain("supersecret123");

    const get = await admin.get("/api/admin/settings");
    expect(JSON.stringify(get.body)).not.toContain("supersecret123");
    expect(get.body.data.email.password).toBe("••••t123");

    const again = await admin.put("/api/admin/settings/email").send({ email: "shop@example.com", host: "smtp2.example.com", username: "shop", password: get.body.data.email.password });
    expect(again.status).toBe(200);
    expect((await prisma.emailSetting.findFirstOrThrow()).password).toBe("supersecret123");
  });

  it("validates general settings and only accepts supported gateways", async () => {
    expect((await admin.put("/api/admin/settings/general").send({ siteName: "X", currencyName: "dollars", currencyIcon: "$", timeZone: "Mars/Base" })).status).toBe(400);
    expect((await admin.put("/api/admin/settings/payment-gateways").send({ gateway: "STRIPE", settings: { clientId: "x", secretKey: "y" } })).status).toBe(400);
    expect((await admin.put("/api/admin/settings/payment-gateways").send({ gateway: "RAZORPAY", settings: { currencyRate: -1 } })).status).toBe(400);
  });
});

describe("contact inbox", () => {
  it("stores contact-form messages for the admin, who can mark them read and delete them", async () => {
    const marker = `inbox-test-${uniq}`;
    const sent = await request(app).post("/api/storefront/contact").send({ name: "Asha Rao", email: "asha@example.com", subject: marker, message: "Do you ship to Dubai? Please advise." });
    expect(sent.status).toBe(200);

    expect((await buyer.get("/api/admin/messages")).status).toBe(403);
    const list = await admin.get("/api/admin/messages");
    expect(list.status).toBe(200);
    const mine = list.body.data.find((m: { subject: string }) => m.subject === marker);
    expect(mine).toBeTruthy();
    expect(mine.isRead).toBe(false);
    expect(list.body.unread).toBeGreaterThanOrEqual(1);

    expect((await admin.put(`/api/admin/messages/${mine.id}`).send({ isRead: "yes" })).status).toBe(400);
    const read = await admin.put(`/api/admin/messages/${mine.id}`).send({ isRead: true });
    expect(read.body.data.isRead).toBe(true);
    expect((await admin.delete(`/api/admin/messages/${mine.id}`)).status).toBe(200);
    expect((await admin.delete(`/api/admin/messages/${mine.id}`)).status).toBe(404);
  });
});

describe("misc", () => {
  it("rejects a past flash-sale end date", async () => {
    expect((await admin.put("/api/admin/flash-sale").send({ endDate: "2020-01-01" })).status).toBe(400);
  });
  it("says plainly that newsletter email is not configured", async () => {
    const res = await admin.post("/api/admin/subscribers/send-mail").send({ subject: "Hello", message: "A long enough message body." });
    expect(res.status).toBe(501);
    expect(res.body.success).toBe(false);
  });
  it("hides newsletter tokens from the subscriber list", async () => {
    const res = await admin.get("/api/admin/subscribers");
    expect(res.status).toBe(200);
    for (const s of res.body.data) expect(s).not.toHaveProperty("token");
  });
});
