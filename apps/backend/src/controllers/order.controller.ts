import { Request, Response } from "express";
import { prisma } from "@ecommerce/database";
import { CheckoutInput, PricingRequest, VerifyPaymentInput } from "@ecommerce/shared-types";
import { env } from "../config/env";
import { CheckoutService } from "../services/checkout.service";
import { fromCents, priceOrder } from "../services/pricing.service";
import { AppError } from "../utils/errors";

/** Handlers run behind `validate()` + `asyncHandler()`: inputs are already parsed and typed. */
export class OrderController {
  /** Cart preview: every number comes from the database, never from the client. */
  static async calculatePricing(req: Request, res: Response) {
    const body = req.body as PricingRequest;
    const priced = await priceOrder(prisma, {
      items: body.items,
      couponCode: body.couponCode,
      shippingRuleId: body.shippingRuleId,
      userId: req.user?.id,
      strictCoupon: false,
      paymentMethod: body.paymentMethod,
      giftWrap: body.giftWrap,
    });

    return res.json({
      success: true,
      data: {
        items: priced.lines.map((l) => ({
          productId: l.productId,
          name: l.productName,
          slug: l.slug,
          image: l.thumbImage,
          qty: l.qty,
          unitPrice: fromCents(l.unitPriceCents),
          variantTotal: fromCents(l.variantTotalCents),
          lineTotal: fromCents(l.lineTotalCents),
          variants: l.variants,
        })),
        subTotal: fromCents(priced.subTotalCents),
        discount: fromCents(priced.discountCents),
        shippingCost: fromCents(priced.shippingCents),
        prepaidDiscount: fromCents(priced.prepaidDiscountCents),
        codFee: fromCents(priced.codFeeCents),
        giftWrap: priced.giftWrap,
        giftWrapFee: fromCents(priced.giftWrapFeeCents),
        finalPayable: fromCents(priced.totalCents),
        coupon: priced.coupon && {
          code: priced.coupon.code,
          discountType: priced.coupon.discountType,
          discount: priced.coupon.discount,
        },
        couponError: priced.couponError,
        shippingRule: priced.shipping && {
          id: priced.shipping.id,
          name: priced.shipping.name,
          type: priced.shipping.type,
          cost: fromCents(priced.shipping.costCents),
        },
        onlinePaymentAvailable: env.razorpayEnabled,
      },
    });
  }

  static async checkout(req: Request, res: Response) {
    const result = await CheckoutService.placeOrder(req.user!.id, req.body as CheckoutInput);
    return res.status(201).json({
      success: true,
      message: result.gateway ? "Order created. Complete the payment to confirm it." : "Order placed successfully",
      data: result,
    });
  }

  static async verifyPayment(req: Request, res: Response) {
    const order = await CheckoutService.confirmPayment(req.user!.id, req.body as VerifyPaymentInput);
    return res.json({
      success: true,
      message: "Payment confirmed",
      data: { orderId: order.id, invoiceId: order.invoiceId, paymentStatus: order.paymentStatus },
    });
  }

  static async cancelOrder(req: Request, res: Response) {
    const order = await CheckoutService.cancelOwnOrder(req.user!.id, req.params.id);
    return res.json({
      success: true,
      message: "Order cancelled",
      data: { orderId: order.id, orderStatus: order.orderStatus },
    });
  }

  static async getUserOrders(req: Request, res: Response) {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      include: { orderProducts: true, transaction: true },
    });
    return res.json({ success: true, data: orders });
  }

  /**
   * Guest tracking needs the invoice number AND the email used on the order, so invoice numbers
   * alone can't be enumerated. The same 404 is returned whichever of the two is wrong.
   */
  static async trackOrder(req: Request, res: Response) {
    const invoiceId = Number(req.params.invoiceId);
    const email = String(req.query.email);

    const order = await prisma.order.findUnique({
      where: { invoiceId },
      select: {
        id: true,
        invoiceId: true,
        orderStatus: true,
        paymentStatus: true,
        createdAt: true,
        updatedAt: true,
        orderAddress: true,
        orderProducts: { select: { productName: true, qty: true, unitPrice: true } },
      },
    });

    const orderEmail = String((order?.orderAddress as { email?: string } | null)?.email ?? "").toLowerCase();
    if (!order || orderEmail !== email) throw AppError.notFound("No order found for this invoice number and email");

    const { orderAddress: _omit, ...safe } = order;
    return res.json({ success: true, data: safe });
  }
}
