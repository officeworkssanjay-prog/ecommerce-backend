import fs from "fs";
import path from "path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@ecommerce/database";
import { app } from "../app";

const SKU = "SJ-DIA-102";
const PNG_1PX =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
const uniq = Date.now().toString(36);
const emailA = `buyer-a-${uniq}@example.com`;
const emailB = `buyer-b-${uniq}@example.com`;
const goodAddress = {
  name: "Test Buyer",
  email: emailA,
  phone: "+91 98765 43210",
  country: "India",
  state: "Rajasthan",
  city: "Jaipur",
  zipCode: "302001",
  address: "12 Heritage Lane",
};

let buyerA: ReturnType<typeof request.agent>;
let buyerB: ReturnType<typeof request.agent>;
let admin: ReturnType<typeof request.agent>;
let productId: string;
let originalQty: number;
let userAId: string;
let userBId: string;
const uploadedFiles: string[] = [];
const orderIds: string[] = [];

beforeAll(async () => {
  const product = await prisma.product.findUniqueOrThrow({ where: { sku: SKU } });
  productId = product.id;
  originalQty = product.qty;

  buyerA = request.agent(app);
  buyerB = request.agent(app);
  admin = request.agent(app);

  const a = await buyerA.post("/api/auth/register").send({ name: "Buyer A", email: emailA, password: "Passw0rdA" });
  const b = await buyerB.post("/api/auth/register").send({ name: "Buyer B", email: emailB, password: "Passw0rdB" });
  expect(a.status).toBe(201);
  expect(b.status).toBe(201);
  userAId = a.body.user.id;
  userBId = b.body.user.id;
  expect((await admin.post("/api/auth/login").send({ email: "admin@sawariyajewels.com", password: "admin123" })).status).toBe(200);
});

afterAll(async () => {
  await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
  await prisma.product.update({ where: { id: productId }, data: { qty: originalQty } });
  await prisma.user.deleteMany({ where: { id: { in: [userAId, userBId] } } }); // cascades addresses, reviews, chats, wishlist
  for (const f of uploadedFiles) fs.rmSync(path.join(__dirname, "../../uploads", f), { force: true });
  await prisma.contactMessage.deleteMany({ where: { email: "asha@example.com" } });
  await prisma.$disconnect();
});

describe("auth", () => {
  it("rejects weak passwords and bad emails with field errors", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "A", email: "nope", password: "abc" });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.errors)).toEqual(expect.arrayContaining(["name", "email", "password"]));
  });

  it("rejects a duplicate email (case-insensitive) with 409", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Buyer A", email: emailA.toUpperCase(), password: "Passw0rdA" });
    expect(res.status).toBe(409);
  });

  it("gives the same answer for a wrong password and an unknown email", async () => {
    const wrong = await request(app).post("/api/auth/login").send({ email: emailA, password: "WrongPass1" });
    const unknown = await request(app).post("/api/auth/login").send({ email: `nobody-${uniq}@example.com`, password: "WrongPass1" });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.message).toBe(unknown.body.message);
  });

  it("protects authenticated and admin-only routes", async () => {
    expect((await request(app).get("/api/user/profile")).status).toBe(401);
    expect((await buyerA.get("/api/admin/dashboard")).status).toBe(403);
    expect((await admin.get("/api/admin/dashboard")).status).toBe(200);
  });

  it("returns a JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("profile", () => {
  it("validates profile updates and lets the phone be cleared", async () => {
    expect((await buyerA.put("/api/user/profile").send({ name: "X" })).status).toBe(400);
    expect((await buyerA.put("/api/user/profile").send({ phone: "abc" })).status).toBe(400);
    expect((await buyerA.put("/api/user/profile").send({ avatar: "javascript:alert(1)" })).status).toBe(400);
    const ok = await buyerA.put("/api/user/profile").send({ name: "Buyer Alpha", phone: "+91 98765 43210" });
    expect(ok.status).toBe(200);
    expect(ok.body.data.phone).toBe("+91 98765 43210");
    const cleared = await buyerA.put("/api/user/profile").send({ phone: "" });
    expect(cleared.body.data.phone).toBeNull();
  });

  it("enforces the password rules when changing password", async () => {
    expect((await buyerA.post("/api/user/change-password").send({ currentPassword: "Passw0rdA", newPassword: "short" })).status).toBe(400);
    expect((await buyerA.post("/api/user/change-password").send({ currentPassword: "Passw0rdA", newPassword: "Passw0rdA" })).status).toBe(400);
    expect((await buyerA.post("/api/user/change-password").send({ currentPassword: "nope", newPassword: "Another1Pass" })).status).toBe(400);
  });
});

describe("addresses", () => {
  let addrId: string;
  let secondId: string;

  it("validates input and makes the first address the default", async () => {
    const bad = await buyerA.post("/api/user/addresses").send({ ...goodAddress, phone: "12", zipCode: "!" });
    expect(bad.status).toBe(400);
    expect(Object.keys(bad.body.errors)).toEqual(expect.arrayContaining(["phone", "zipCode"]));

    const created = await buyerA.post("/api/user/addresses").send(goodAddress);
    expect(created.status).toBe(201);
    expect(created.body.data.isDefault).toBe(true);
    addrId = created.body.data.id;
  });

  it("does not let another buyer read, edit, delete or default someone else's address", async () => {
    expect((await buyerB.get("/api/user/addresses")).body.data).toHaveLength(0);
    expect((await buyerB.put(`/api/user/addresses/${addrId}`).send({ city: "Hacked" })).status).toBe(404);
    expect((await buyerB.put(`/api/user/addresses/${addrId}/default`)).status).toBe(404);
    expect((await buyerB.delete(`/api/user/addresses/${addrId}`)).status).toBe(404);
    expect((await prisma.userAddress.findUniqueOrThrow({ where: { id: addrId } })).city).toBe("Jaipur");
  });

  it("returns 400 (not 500) for malformed ids", async () => {
    expect((await buyerA.put("/api/user/addresses/not-a-uuid/default")).status).toBe(400);
  });

  it("promotes another address when the default one is deleted", async () => {
    const second = await buyerA.post("/api/user/addresses").send({ ...goodAddress, city: "Udaipur" });
    secondId = second.body.data.id;
    expect(second.body.data.isDefault).toBe(false);
    expect((await buyerA.delete(`/api/user/addresses/${addrId}`)).status).toBe(200);
    const rest = await buyerA.get("/api/user/addresses");
    expect(rest.body.data).toHaveLength(1);
    expect(rest.body.data[0].id).toBe(secondId);
    expect(rest.body.data[0].isDefault).toBe(true);
  });
});

describe("wishlist", () => {
  it("only accepts real, active products", async () => {
    expect((await buyerA.post("/api/user/wishlist/not-a-uuid")).status).toBe(400);
    expect((await buyerA.post("/api/user/wishlist/11111111-1111-4111-8111-111111111111")).status).toBe(404);
    expect((await buyerA.post(`/api/user/wishlist/${productId}`)).status).toBe(201);
    expect((await buyerA.post(`/api/user/wishlist/${productId}`)).status).toBe(201); // idempotent
    expect((await buyerA.get("/api/user/wishlist")).body.data).toHaveLength(1);
    expect((await buyerA.delete(`/api/user/wishlist/${productId}`)).status).toBe(200);
    expect((await buyerA.get("/api/user/wishlist")).body.data).toHaveLength(0);
  });
});

describe("reviews", () => {
  it("validates the rating and text", async () => {
    for (const body of [
      { productId, rating: 0, review: "Lovely piece, truly." },
      { productId, rating: 6, review: "Lovely piece, truly." },
      { productId, rating: 5, review: "short" },
      { productId: "x", rating: 5, review: "Lovely piece, truly." },
    ]) {
      expect((await buyerA.post("/api/user/reviews").send(body)).status).toBe(400);
    }
  });

  it("requires a delivered purchase, then allows exactly one review", async () => {
    const review = { productId, rating: 5, review: "Exquisite craftsmanship, arrived beautifully packed." };
    expect((await buyerA.post("/api/user/reviews").send(review)).status).toBe(403); // never bought it

    const address = (await buyerA.get("/api/user/addresses")).body.data[0];
    const order = await buyerA.post("/api/order/checkout").send({ items: [{ productId, qty: 1 }], addressId: address.id, paymentMethod: "COD" });
    expect(order.status).toBe(201);
    orderIds.push(order.body.data.orderId);

    expect((await buyerA.post("/api/user/reviews").send(review)).status).toBe(403); // not delivered yet
    await prisma.order.update({ where: { id: order.body.data.orderId }, data: { orderStatus: "DELIVERED" } });

    const ok = await buyerA.post("/api/user/reviews").send(review);
    expect(ok.status).toBe(201);
    expect(ok.body.data.status).toBe(false); // waits for moderation
    expect((await buyerA.post("/api/user/reviews").send(review)).status).toBe(409);

    // Buyer B never bought it
    expect((await buyerB.post("/api/user/reviews").send(review)).status).toBe(403);
  });
});

describe("chat", () => {
  it("lets buyers talk to the store admin only", async () => {
    const agent = await buyerA.get("/api/chat/support-agent");
    expect(agent.status).toBe(200);
    expect(agent.body.data.role).toBe("ADMIN");
    const adminId = agent.body.data.id;

    expect((await buyerA.post("/api/chat/send").send({ receiverId: userBId, message: "hi" })).status).toBe(403);
    expect((await buyerA.post("/api/chat/send").send({ receiverId: userAId, message: "hi" })).status).toBe(400); // self
    expect((await buyerA.post("/api/chat/send").send({ receiverId: adminId, message: "   " })).status).toBe(400);
    expect((await buyerA.post("/api/chat/send").send({ receiverId: "nope", message: "hi" })).status).toBe(400);
    expect((await buyerA.get(`/api/chat/messages/${userBId}`)).status).toBe(403);

    expect((await buyerA.post("/api/chat/send").send({ receiverId: adminId, message: "Do you offer resizing?" })).status).toBe(201);
    expect((await admin.post("/api/chat/send").send({ receiverId: userAId, message: "Yes, free of charge." })).status).toBe(201);
    const thread = await buyerA.get(`/api/chat/messages/${adminId}`);
    expect(thread.body.data).toHaveLength(2);
    // Buyer B can't see A's thread
    expect((await buyerB.get(`/api/chat/messages/${adminId}`)).body.data).toHaveLength(0);
  });
});

describe("upload", () => {
  it("requires login", async () => {
    expect((await request(app).post("/api/upload").send({ image: PNG_1PX })).status).toBe(401);
  });

  it("accepts a real image and stores it under a server-generated name", async () => {
    const res = await buyerA.post("/api/upload").send({ image: PNG_1PX, filename: "../../evil.png" });
    expect(res.status).toBe(200);
    expect(res.body.url).toMatch(/^\/uploads\/\d+-[a-f0-9]{12}\.png$/);
    uploadedFiles.push(res.body.filename);
    expect(fs.existsSync(path.join(__dirname, "../../uploads", res.body.filename))).toBe(true);
  });

  it("rejects files that only claim to be images", async () => {
    const fake = "data:image/png;base64," + Buffer.from("<script>alert(1)</script> not really a png").toString("base64");
    expect((await buyerA.post("/api/upload").send({ image: fake })).status).toBe(400);
    const svg = "data:image/svg+xml;base64," + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>1</script></svg>').toString("base64");
    expect((await buyerA.post("/api/upload").send({ image: svg })).status).toBe(400);
    expect((await buyerA.post("/api/upload").attach("image", Buffer.from("MZ not an image at all, just text"), { filename: "a.png", contentType: "image/png" })).status).toBe(400);
    expect((await buyerA.post("/api/upload").send({})).status).toBe(400);
  });

  it("accepts a real multipart image upload", async () => {
    const png = Buffer.from(PNG_1PX.split(",")[1], "base64");
    const res = await buyerA.post("/api/upload").attach("image", png, { filename: "pic.png", contentType: "image/png" });
    expect(res.status).toBe(200);
    uploadedFiles.push(res.body.filename);
  });
});

describe("storefront input", () => {
  it("treats empty filter values as not provided, and rejects bad ones with 400", async () => {
    expect((await request(app).get("/api/storefront/products?minPrice=&maxPrice=&search=&category=")).status).toBe(200);
    expect((await request(app).get("/api/storefront/products?page=-1")).status).toBe(400);
    expect((await request(app).get("/api/storefront/products?limit=100000")).status).toBe(400);
    expect((await request(app).get("/api/storefront/products?minPrice=500&maxPrice=100")).status).toBe(400);
    expect((await request(app).get("/api/storefront/products?sort=hacked")).status).toBe(400);
    expect((await request(app).get("/api/storefront/blogs?page=abc")).status).toBe(400);
  });

  it("filters by sub-category and child category, and supports the popular sort", async () => {
    const sub = await request(app).get("/api/storefront/products?subCategory=jadau-chokers");
    expect(sub.status).toBe(200);
    expect(sub.body.data.products.length).toBeGreaterThan(0);
    for (const p of sub.body.data.products) expect(p.subCategoryId).toBeTruthy();
    const none = await request(app).get("/api/storefront/products?subCategory=does-not-exist");
    expect(none.body.data.products).toHaveLength(0);
    expect((await request(app).get("/api/storefront/products?sort=popular")).status).toBe(200);
  });

  it("validates contact and newsletter forms", async () => {
    const contact = await request(app).post("/api/storefront/contact").send({ name: "A", email: "bad", message: "hi" });
    expect(contact.status).toBe(400);
    expect(Object.keys(contact.body.errors)).toEqual(expect.arrayContaining(["name", "email", "message"]));
    expect(
      (await request(app).post("/api/storefront/contact").send({ name: "Asha", email: "asha@example.com", message: "Do you ship abroad?" })).status
    ).toBe(200);
    expect((await request(app).post("/api/storefront/newsletter-subscribe").send({ email: "nope" })).status).toBe(400);
    expect((await request(app).get("/api/storefront/newsletter-verify/nonsense")).status).toBe(400);
  });

  it("only lets signed-in users comment, and only on a real blog", async () => {
    expect((await request(app).post("/api/storefront/blogs/11111111-1111-4111-8111-111111111111/comments").send({ comment: "Nice" })).status).toBe(401);
    expect((await buyerA.post("/api/storefront/blogs/11111111-1111-4111-8111-111111111111/comments").send({ comment: "Nice read" })).status).toBe(404);
    expect((await buyerA.post("/api/storefront/blogs/not-a-uuid/comments").send({ comment: "Nice read" })).status).toBe(400);
  });
});
