import crypto from "crypto";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "@ecommerce/database";

// The real Razorpay HTTP call is replaced; signature verification stays real.
vi.mock("../services/razorpay.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/razorpay.service")>();
  return { ...actual, createGatewayOrder: vi.fn(async () => ({ id: "order_unit_test_1", keyId: "rzp_test_unit_key" })) };
});

import { app } from "../app";

const SKU = "SJ-KND-001";
const createdOrderIds: string[] = [];
let agent: ReturnType<typeof request.agent>;
let productId: string;
let originalQty: number;
let originalCouponUsed: number;
let userAddressId: string;
let otherUserId: string;
let otherAddressId: string;
let createdGatewaySetting = false;

const item = (qty = 1, extra: Record<string, unknown> = {}) => ({ productId, qty, ...extra });
const stock = async () => (await prisma.product.findUniqueOrThrow({ where: { id: productId } })).qty;

beforeAll(async () => {
  const product = await prisma.product.findUniqueOrThrow({ where: { sku: SKU } });
  productId = product.id;
  originalQty = product.qty;
  originalCouponUsed = (await prisma.coupon.findUniqueOrThrow({ where: { code: "ROYAL10" } })).totalUsed;

  agent = request.agent(app);
  const login = await agent.post("/api/auth/login").send({ email: "collector@gmail.com", password: "user123" });
  expect(login.status).toBe(200);

  const user = await prisma.user.findUniqueOrThrow({ where: { email: "collector@gmail.com" } });
  userAddressId = (await prisma.userAddress.findFirstOrThrow({ where: { userId: user.id } })).id;

  const other = await prisma.user.upsert({
    where: { email: "checkout-test-other@example.com" },
    update: {},
    create: { name: "Other Buyer", email: "checkout-test-other@example.com", password: "x" },
  });
  otherUserId = other.id;
  otherAddressId = (
    await prisma.userAddress.create({
      data: { userId: other.id, name: "Other", email: other.email, phone: "+91 90000 00000", country: "India", state: "RJ", city: "Jaipur", zipCode: "302001", address: "1 Test Street" },
    })
  ).id;

  // Razorpay needs a gateway currency matching the store currency (USD in the seed) to skip conversion.
  if (!(await prisma.razorpaySetting.findFirst())) {
    await prisma.razorpaySetting.create({ data: { status: true, currencyName: "USD", currencyRate: 1, razorpayKey: "unused", razorpaySecretKey: "unused" } });
    createdGatewaySetting = true;
  }
});

afterAll(async () => {
  await prisma.order.deleteMany({ where: { id: { in: createdOrderIds } } });
  await prisma.product.update({ where: { id: productId }, data: { qty: originalQty } });
  await prisma.coupon.update({ where: { code: "ROYAL10" }, data: { totalUsed: originalCouponUsed } });
  await prisma.user.delete({ where: { id: otherUserId } }); // cascades its address
  if (createdGatewaySetting) await prisma.razorpaySetting.deleteMany({});
  await prisma.$disconnect();
});

describe("POST /api/order/calculate-pricing", () => {
  it("ignores client-supplied prices and uses database prices", async () => {
    const res = await request(app)
      .post("/api/order/calculate-pricing")
      .send({ items: [item(2, { price: 0.01, unitPrice: 0.01, name: "cheap", variantTotal: -500 })] });
    expect(res.status).toBe(200);
    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    const unit = Number(product.offerPrice ?? product.price);
    expect(res.body.data.items[0].unitPrice).toBe(unit);
    expect(res.body.data.subTotal).toBeGreaterThanOrEqual(unit * 2);
  });

  it.each([
    ["empty cart", { items: [] }],
    ["zero quantity", { items: [{ productId: "x", qty: 0 }] }],
    ["negative quantity", { items: [{ productId: "11111111-1111-4111-8111-111111111111", qty: -3 }] }],
    ["non-uuid product", { items: [{ productId: "abc", qty: 1 }] }],
    ["huge quantity", { items: [{ productId: "11111111-1111-4111-8111-111111111111", qty: 9999 }] }],
  ])("rejects %s with 400 and field errors", async (_name, body) => {
    const res = await request(app).post("/api/order/calculate-pricing").send(body);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeTruthy();
  });

  it("rejects an unknown product", async () => {
    const res = await request(app)
      .post("/api/order/calculate-pricing")
      .send({ items: [{ productId: "11111111-1111-4111-8111-111111111111", qty: 1 }] });
    expect(res.status).toBe(400);
  });

  it("returns 409 when more than the stock is requested", async () => {
    const res = await request(app)
      .post("/api/order/calculate-pricing")
      .send({ items: [item(originalQty + 1 > 20 ? 20 : originalQty + 1)] });
    expect(res.status).toBe(409);
  });

  it("reports an invalid coupon without failing the preview", async () => {
    const res = await request(app).post("/api/order/calculate-pricing").send({ items: [item()], couponCode: "NOPE" });
    expect(res.status).toBe(200);
    expect(res.body.data.coupon).toBeNull();
    expect(res.body.data.couponError).toMatch(/not valid/i);
  });

  it("applies a valid coupon discount", async () => {
    const res = await request(app).post("/api/order/calculate-pricing").send({ items: [item()], couponCode: "royal10" });
    expect(res.body.data.coupon.code).toBe("ROYAL10");
    expect(res.body.data.discount).toBeCloseTo(res.body.data.subTotal * 0.1, 2);
  });
});

describe("POST /api/order/checkout", () => {
  it("requires authentication", async () => {
    const res = await request(app).post("/api/order/checkout").send({ items: [item()], addressId: userAddressId, paymentMethod: "COD" });
    expect(res.status).toBe(401);
  });

  it("rejects unsupported payment methods", async () => {
    const res = await agent.post("/api/order/checkout").send({ items: [item()], addressId: userAddressId, paymentMethod: "STRIPE" });
    expect(res.status).toBe(400);
    expect(res.body.errors.paymentMethod).toBeTruthy();
  });

  it("does not invent an address when none is given", async () => {
    const res = await agent.post("/api/order/checkout").send({ items: [item()], paymentMethod: "COD" });
    expect(res.status).toBe(400);
    expect(res.body.errors.addressId).toBeTruthy();
  });

  it("rejects another user's address", async () => {
    const res = await agent.post("/api/order/checkout").send({ items: [item()], addressId: otherAddressId, paymentMethod: "COD" });
    expect(res.status).toBe(400);
  });

  it("rejects an invalid coupon at checkout instead of ignoring it", async () => {
    const before = await stock();
    const res = await agent.post("/api/order/checkout").send({ items: [item()], addressId: userAddressId, paymentMethod: "COD", couponCode: "NOPE" });
    expect(res.status).toBe(400);
    expect(await stock()).toBe(before); // nothing reserved
  });

  it("places a COD order with server prices, reserves stock, counts the coupon; cancel restocks", async () => {
    const before = await stock();
    const res = await agent
      .post("/api/order/checkout")
      .send({ items: [item(2, { price: 1 })], addressId: userAddressId, paymentMethod: "COD", couponCode: "ROYAL10" });
    expect(res.status).toBe(201);
    const { orderId, invoiceId } = res.body.data;
    createdOrderIds.push(orderId);

    const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { orderProducts: true, transaction: true } });
    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    const unit = Number(product.offerPrice ?? product.price);
    expect(Number(order.orderProducts[0].unitPrice)).toBe(unit);
    expect(Number(order.subTotal)).toBeCloseTo(unit * 2, 2);
    expect(Number(order.amount)).toBeLessThan(Number(order.subTotal) + 100); // 10% off plus shipping
    expect(order.paymentStatus).toBe("UNPAID");
    expect(order.transaction?.transactionId).toBe(`COD-${invoiceId}`);
    expect(await stock()).toBe(before - 2);
    expect((await prisma.coupon.findUniqueOrThrow({ where: { code: "ROYAL10" } })).totalUsed).toBe(originalCouponUsed + 1);

    // Someone else cannot cancel it
    const other = await request(app).post(`/api/order/${orderId}/cancel`);
    expect(other.status).toBe(401);

    const cancel = await agent.post(`/api/order/${orderId}/cancel`);
    expect(cancel.status).toBe(200);
    expect(await stock()).toBe(before);
    expect((await prisma.coupon.findUniqueOrThrow({ where: { code: "ROYAL10" } })).totalUsed).toBe(originalCouponUsed);

    const again = await agent.post(`/api/order/${orderId}/cancel`);
    expect(again.status).toBe(409);
  });

  it("never oversells: two parallel orders for the last units can't both succeed", async () => {
    await prisma.product.update({ where: { id: productId }, data: { qty: 1 } });
    const send = () => agent.post("/api/order/checkout").send({ items: [item(1)], addressId: userAddressId, paymentMethod: "COD" });
    const results = await Promise.all([send(), send()]);
    for (const r of results) if (r.status === 201) createdOrderIds.push(r.body.data.orderId);
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    expect(await stock()).toBe(0);
    await prisma.product.update({ where: { id: productId }, data: { qty: originalQty } });
  });
});

describe("fees, prepaid discount and delivery areas", () => {
  const preview = async (extra: Record<string, unknown>) =>
    (await request(app).post("/api/order/calculate-pricing").send({ items: [item(1)], ...extra })).body.data;

  it("adds the COD fee, applies the prepaid discount and charges gift wrap from store settings", async () => {
    const g = await prisma.generalSetting.findFirstOrThrow();
    const base = await preview({});
    const cod = await preview({ paymentMethod: "COD" });
    const online = await preview({ paymentMethod: "RAZORPAY" });
    const wrapped = await preview({ paymentMethod: "COD", giftWrap: true });
    expect(cod.codFee).toBe(Number(g.codFee));
    expect(cod.finalPayable).toBeCloseTo(base.finalPayable + Number(g.codFee), 2);
    const expectedOff = Math.round((base.finalPayable - base.shippingCost) * Number(g.prepaidDiscountPercent)) / 100;
    expect(online.prepaidDiscount).toBeCloseTo(expectedOff, 1);
    expect(online.codFee).toBe(0);
    expect(wrapped.giftWrapFee).toBe(Number(g.giftWrapFee));
    expect(wrapped.finalPayable).toBeCloseTo(cod.finalPayable + Number(g.giftWrapFee), 2);
  });

  it("does not restrict delivery until pincodes are configured, then enforces them", async () => {
    const open = await request(app).get("/api/storefront/pincode/302001");
    expect(open.body.data.configured).toBe(false);
    expect((await request(app).get("/api/storefront/pincode/12")).status).toBe(400);

    const row = await prisma.serviceablePincode.create({ data: { pincode: "560001", city: "Bengaluru", deliveryDays: 4, codAvailable: false } });
    try {
      expect((await request(app).get("/api/storefront/pincode/560001")).body.data).toMatchObject({ configured: true, serviceable: true, deliveryDays: 4, codAvailable: false });
      expect((await request(app).get("/api/storefront/pincode/302001")).body.data.serviceable).toBe(false);
      const res = await agent.post("/api/order/checkout").send({ items: [item(1)], addressId: userAddressId, paymentMethod: "COD" });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/do not deliver/i);
    } finally {
      await prisma.serviceablePincode.delete({ where: { id: row.id } });
    }
  });

  it("saves a notify-me request only for sold-out products, once per email", async () => {
    const inStock = await request(app).post(`/api/storefront/products/${(await prisma.product.findUniqueOrThrow({ where: { id: productId } })).slug}/notify`).send({ email: "a@example.com" });
    expect(inStock.status).toBe(400);
    const out = await prisma.product.create({
      data: { name: "Notify Test", slug: "notify-test-item", sku: "NOTIFY-T-1", price: 100, qty: 0, shortDescription: "x", longDescription: "x", thumbImage: "/x.png", categoryId: (await prisma.product.findUniqueOrThrow({ where: { id: productId } })).categoryId, status: true },
    });
    try {
      for (let i = 0; i < 2; i++) {
        const r = await request(app).post("/api/storefront/products/notify-test-item/notify").send({ email: "Buyer@Example.com" });
        expect(r.status).toBe(201);
      }
      expect(await prisma.stockAlert.count({ where: { productId: out.id } })).toBe(1);
      expect((await request(app).post("/api/storefront/products/notify-test-item/notify").send({ email: "nope" })).status).toBe(400);
    } finally {
      await prisma.product.delete({ where: { id: out.id } });
    }
  });
});

describe("Razorpay payment verification", () => {
  it("only marks the order PAID with a valid signature", async () => {
    const res = await agent.post("/api/order/checkout").send({ items: [item(1)], addressId: userAddressId, paymentMethod: "RAZORPAY" });
    expect(res.status).toBe(201);
    const { orderId, gateway } = res.body.data;
    createdOrderIds.push(orderId);
    expect(gateway.orderId).toBe("order_unit_test_1");

    const payload = { orderId, razorpayOrderId: gateway.orderId, razorpayPaymentId: "pay_unit_1" };

    const forged = await agent.post("/api/order/payment/verify").send({ ...payload, razorpaySignature: "deadbeef" });
    expect(forged.status).toBe(400);
    expect((await prisma.order.findUniqueOrThrow({ where: { id: orderId } })).paymentStatus).toBe("UNPAID");

    const wrongOrder = await agent.post("/api/order/payment/verify").send({ ...payload, razorpayOrderId: "order_other", razorpaySignature: "x" });
    expect(wrongOrder.status).toBe(400);

    const signature = crypto.createHmac("sha256", "rzp_test_unit_secret_value").update(`${gateway.orderId}|pay_unit_1`).digest("hex");
    const ok = await agent.post("/api/order/payment/verify").send({ ...payload, razorpaySignature: signature });
    expect(ok.status).toBe(200);
    expect(ok.body.data.paymentStatus).toBe("PAID");

    const repeat = await agent.post("/api/order/payment/verify").send({ ...payload, razorpaySignature: signature });
    expect(repeat.status).toBe(200);
    expect(await prisma.transaction.count({ where: { orderId } })).toBe(1);

    // A paid order can't be cancelled by the buyer (needs a refund)
    expect((await agent.post(`/api/order/${orderId}/cancel`)).status).toBe(409);
  });
});

describe("GET /api/order/track/:invoiceId", () => {
  it("needs the matching email, and answers wrong guesses with the same 404", async () => {
    const res = await agent.post("/api/order/checkout").send({ items: [item(1)], addressId: userAddressId, paymentMethod: "COD" });
    const { orderId, invoiceId } = res.body.data;
    createdOrderIds.push(orderId);

    expect((await request(app).get(`/api/order/track/${invoiceId}`)).status).toBe(400); // no email
    expect((await request(app).get(`/api/order/track/${invoiceId}?email=wrong@example.com`)).status).toBe(404);
    expect((await request(app).get(`/api/order/track/999999999?email=collector@gmail.com`)).status).toBe(404);

    const ok = await request(app).get(`/api/order/track/${invoiceId}?email=Collector@Gmail.com`);
    expect(ok.status).toBe(200);
    expect(ok.body.data.orderAddress).toBeUndefined(); // no address leaked
    expect(ok.body.data.invoiceId).toBe(invoiceId);
  });
});
