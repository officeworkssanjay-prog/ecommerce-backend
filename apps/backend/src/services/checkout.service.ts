import { prisma, Prisma, OrderStatus, PaymentStatus } from "@ecommerce/database";
import { CheckoutInput, VerifyPaymentInput } from "@ecommerce/shared-types";
import { env } from "../config/env";
import { AppError } from "../utils/errors";
import { Db, fromCents, priceOrder, toCents } from "./pricing.service";
import { checkPincode } from "./pincode.service";
import { createGatewayOrder, verifyPaymentSignature } from "./razorpay.service";

/** How a store-currency amount converts to what Razorpay charges. */
async function getGatewayTerms(storeCurrency: string) {
  const setting = await prisma.razorpaySetting.findFirst();
  const currency = setting?.currencyName || "INR";
  if (currency === storeCurrency) return { currency, rate: 1 };
  if (setting?.currencyRate && Number(setting.currencyRate) > 0) {
    return { currency, rate: Number(setting.currencyRate) };
  }
  throw new AppError(503, "Online payment is not configured for this store currency. Please choose cash on delivery.");
}

const isInvoiceCollision = (err: unknown) =>
  err instanceof Prisma.PrismaClientKnownRequestError &&
  err.code === "P2002" &&
  String(err.meta?.target ?? "").includes("invoiceId");

/** Puts stock (and the coupon use) of an order back. Call inside the same transaction that cancels it. */
export async function restockOrder(tx: Db, orderId: string) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: { coupon: true, orderProducts: { select: { productId: true, qty: true } } },
  });
  if (!order) return;

  for (const line of order.orderProducts) {
    await tx.product.update({ where: { id: line.productId }, data: { qty: { increment: line.qty } } });
  }
  const code = (order.coupon as { code?: string } | null)?.code;
  if (code) {
    await tx.coupon.updateMany({ where: { code, totalUsed: { gt: 0 } }, data: { totalUsed: { decrement: 1 } } });
  }
}

export class CheckoutService {
  /**
   * Creates an order atomically. Prices, stock and coupon limits are all decided here from database
   * values; nothing monetary is taken from the client.
   */
  static async placeOrder(userId: string, input: CheckoutInput) {
    const address = await prisma.userAddress.findFirst({ where: { id: input.addressId, userId } });
    if (!address) throw AppError.badRequest("Please select a valid delivery address");

    const general = await prisma.generalSetting.findFirst();
    const currencyName = general?.currencyName || "USD";
    const currencyIcon = general?.currencyIcon || "$";

    // Fail early (before reserving stock) if online payment can't work.
    if (input.paymentMethod === "RAZORPAY" && !env.razorpayEnabled) {
      throw new AppError(503, "Online payment is not available right now. Please choose cash on delivery.");
    }
    const gateway = input.paymentMethod === "RAZORPAY" ? await getGatewayTerms(currencyName) : null;

    let order: Awaited<ReturnType<typeof CheckoutService.createOrderTx>> | null = null;
    for (let attempt = 0; attempt < 5 && !order; attempt++) {
      try {
        order = await CheckoutService.createOrderTx(userId, input, address, currencyName, currencyIcon);
      } catch (err) {
        if (!isInvoiceCollision(err) || attempt === 4) throw err;
      }
    }
    if (!order) throw new AppError(500, "Could not create the order. Please try again.");

    if (!gateway) {
      return { orderId: order.id, invoiceId: order.invoiceId, paymentMethod: "COD" as const, gateway: null };
    }

    // Online payment: create the gateway order after the DB commit; undo the reservation if it fails.
    try {
      const amountMinor = Math.round(toCents(order.amount) * gateway.rate);
      const created = await createGatewayOrder({
        amountMinor,
        currency: gateway.currency,
        receipt: `inv_${order.invoiceId}`,
      });
      await prisma.order.update({ where: { id: order.id }, data: { gatewayOrderId: created.id } });
      return {
        orderId: order.id,
        invoiceId: order.invoiceId,
        paymentMethod: "RAZORPAY" as const,
        gateway: { keyId: created.keyId, orderId: created.id, amount: amountMinor, currency: gateway.currency },
      };
    } catch (err) {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({ where: { id: order!.id }, data: { orderStatus: OrderStatus.CANCELED } });
        await restockOrder(tx, order!.id);
      });
      throw err;
    }
  }

  private static createOrderTx(
    userId: string,
    input: CheckoutInput,
    address: { name: string; email: string; phone: string; country: string; state: string; city: string; zipCode: string; address: string; addressType: string },
    currencyName: string,
    currencyIcon: string
  ) {
    return prisma.$transaction(async (tx) => {
      const priced = await priceOrder(tx, {
        items: input.items,
        couponCode: input.couponCode,
        shippingRuleId: input.shippingRuleId,
        userId,
        strictCoupon: true,
        paymentMethod: input.paymentMethod,
        giftWrap: input.giftWrap,
      });

      // Delivery area (only enforced once the store has configured pincodes)
      const area = await checkPincode(tx, address.zipCode);
      if (area.configured) {
        if (!area.serviceable) throw AppError.badRequest(`Sorry, we do not deliver to pincode ${address.zipCode} yet`);
        if (input.paymentMethod === "COD" && !area.codAvailable) {
          throw AppError.badRequest("Cash on delivery is not available for this pincode. Please pay online.");
        }
      }

      // Reserve stock with a guarded decrement; ordered by id so concurrent orders can't deadlock.
      const need = new Map<string, { qty: number; name: string }>();
      for (const line of priced.lines) {
        const cur = need.get(line.productId);
        need.set(line.productId, { qty: (cur?.qty ?? 0) + line.qty, name: line.productName });
      }
      for (const [productId, { qty, name }] of [...need].sort(([a], [b]) => a.localeCompare(b))) {
        const res = await tx.product.updateMany({
          where: { id: productId, status: true, qty: { gte: qty } },
          data: { qty: { decrement: qty } },
        });
        if (res.count !== 1) throw AppError.conflict(`"${name}" is no longer available in the requested quantity`);
      }

      if (priced.coupon) {
        const res = await tx.coupon.updateMany({
          where: { id: priced.coupon.id, status: true, totalUsed: { lt: priced.coupon.quantity } },
          data: { totalUsed: { increment: 1 } },
        });
        if (res.count !== 1) throw AppError.conflict("This coupon has just been fully redeemed");
      }

      const invoiceId = Math.floor(100000 + Math.random() * 900000);
      const order = await tx.order.create({
        data: {
          invoiceId,
          userId,
          subTotal: fromCents(priced.subTotalCents),
          amount: fromCents(priced.totalCents),
          currencyName,
          currencyIcon,
          productQty: priced.lines.reduce((sum, l) => sum + l.qty, 0),
          paymentMethod: input.paymentMethod,
          prepaidDiscount: fromCents(priced.prepaidDiscountCents),
          codFee: fromCents(priced.codFeeCents),
          giftWrap: priced.giftWrap,
          giftWrapFee: fromCents(priced.giftWrapFeeCents),
          paymentStatus: PaymentStatus.UNPAID,
          orderStatus: OrderStatus.PENDING,
          orderAddress: {
            name: address.name,
            email: address.email,
            phone: address.phone,
            country: address.country,
            state: address.state,
            city: address.city,
            zipCode: address.zipCode,
            address: address.address,
            addressType: address.addressType,
          },
          shippingMethod: priced.shipping
            ? { id: priced.shipping.id, name: priced.shipping.name, type: priced.shipping.type, cost: fromCents(priced.shipping.costCents) }
            : { name: "Standard delivery", type: "flat_cost", cost: 0 },
          coupon: priced.coupon
            ? {
                code: priced.coupon.code,
                name: priced.coupon.name,
                discountType: priced.coupon.discountType,
                discount: priced.coupon.discount,
                calculatedDiscount: fromCents(priced.discountCents),
              }
            : undefined,
          orderProducts: {
            create: priced.lines.map((l) => ({
              productId: l.productId,
              productName: l.productName,
              unitPrice: fromCents(l.unitPriceCents),
              qty: l.qty,
              variantTotal: fromCents(l.variantTotalCents),
              variants: l.variants,
            })),
          },
        },
      });

      if (input.paymentMethod === "COD") {
        await tx.transaction.create({
          data: {
            orderId: order.id,
            transactionId: `COD-${order.invoiceId}`,
            paymentMethod: "COD",
            amount: order.amount,
            amountRealCurrency: order.amount,
            amountRealCurrencyName: currencyName,
          },
        });
      }

      return order;
    });
  }

  /** Marks an online order PAID, but only after the Razorpay signature checks out. Safe to call twice. */
  static async confirmPayment(userId: string, input: VerifyPaymentInput) {
    const order = await prisma.order.findFirst({ where: { id: input.orderId, userId } });
    if (!order) throw AppError.notFound("Order not found");
    if (order.paymentMethod !== "RAZORPAY") throw AppError.badRequest("This order is not an online payment order");
    if (order.orderStatus === OrderStatus.CANCELED) throw AppError.conflict("This order was cancelled");
    if (order.paymentStatus === PaymentStatus.PAID) return order;
    if (!order.gatewayOrderId || order.gatewayOrderId !== input.razorpayOrderId) {
      throw AppError.badRequest("Payment does not match this order");
    }
    if (!verifyPaymentSignature(input.razorpayOrderId, input.razorpayPaymentId, input.razorpaySignature)) {
      throw AppError.badRequest("Payment verification failed");
    }

    const terms = await getGatewayTerms(order.currencyName);
    return prisma.$transaction(async (tx) => {
      const res = await tx.order.updateMany({
        where: { id: order.id, paymentStatus: PaymentStatus.UNPAID, orderStatus: { not: OrderStatus.CANCELED } },
        data: { paymentStatus: PaymentStatus.PAID },
      });
      if (res.count === 1) {
        await tx.transaction.create({
          data: {
            orderId: order.id,
            transactionId: input.razorpayPaymentId,
            paymentMethod: "RAZORPAY",
            amount: order.amount,
            amountRealCurrency: fromCents(Math.round(toCents(order.amount) * terms.rate)),
            amountRealCurrencyName: terms.currency,
          },
        });
      }
      return tx.order.findUniqueOrThrow({ where: { id: order.id } });
    });
  }

  /** Buyer cancels their own order; only possible while it is still PENDING and unpaid. */
  static async cancelOwnOrder(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw AppError.notFound("Order not found");
    if (order.orderStatus !== OrderStatus.PENDING) {
      throw AppError.conflict("Only orders that have not been processed yet can be cancelled");
    }
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw AppError.conflict("This order is already paid. Please contact support to cancel and refund it.");
    }

    return prisma.$transaction(async (tx) => {
      const res = await tx.order.updateMany({
        where: { id: orderId, orderStatus: OrderStatus.PENDING, paymentStatus: PaymentStatus.UNPAID },
        data: { orderStatus: OrderStatus.CANCELED },
      });
      if (res.count !== 1) throw AppError.conflict("This order can no longer be cancelled");
      await restockOrder(tx, orderId);
      return tx.order.findUniqueOrThrow({ where: { id: orderId } });
    });
  }
}
