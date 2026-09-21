import { Request, Response } from "express";
import { prisma, PaymentStatus } from "@ecommerce/database";
import { CheckoutService } from "../services/checkout.service";
import {
  calculateSubTotal,
  calculateCouponDiscount,
  calculateFinalPayableAmount,
  convertToGatewayCurrency,
} from "../utils/pricing.util";

export class OrderController {
  /**
   * Preview and calculate cart pricing with dynamic coupon & shipping rule
   */
  static async calculatePricing(req: Request, res: Response) {
    try {
      const { items, couponCode, shippingRuleId } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ success: false, message: "Cart items required" });
      }

      const subTotal = calculateSubTotal(items);
      let coupon = null;

      if (couponCode) {
        const foundCoupon = await prisma.coupon.findUnique({
          where: { code: couponCode },
        });

        if (
          foundCoupon &&
          foundCoupon.status &&
          new Date() >= foundCoupon.startDate &&
          new Date() <= foundCoupon.endDate &&
          foundCoupon.totalUsed < foundCoupon.quantity
        ) {
          coupon = {
            code: foundCoupon.code,
            discountType: foundCoupon.discountType as "PERCENT" | "AMOUNT",
            discount: foundCoupon.discount,
          };
        }
      }

      const discount = calculateCouponDiscount(subTotal, coupon);

      let shippingCost = 0;
      let shippingRule = null;
      if (shippingRuleId) {
        shippingRule = await prisma.shippingRule.findUnique({
          where: { id: shippingRuleId },
        });
        if (shippingRule && shippingRule.status) {
          shippingCost = shippingRule.cost;
        }
      }

      const finalPayable = calculateFinalPayableAmount(subTotal, discount, shippingCost);

      return res.json({
        success: true,
        data: {
          subTotal,
          discount,
          shippingCost,
          finalPayable,
          coupon,
          shippingRule,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Checkout & Process Payment
   */
  static async checkout(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        items,
        addressId,
        shippingRuleId,
        couponCode,
        paymentMethod,
        stripeToken,
        razorpayPaymentId,
      } = req.body;

      // 1. Fetch user address
      const address = await prisma.userAddress.findUnique({
        where: { id: addressId, userId },
      });
      if (!address) {
        return res.status(400).json({ success: false, message: "Valid address required" });
      }

      // 2. Fetch shipping rule
      const shippingRule = await prisma.shippingRule.findUnique({
        where: { id: shippingRuleId },
      });
      if (!shippingRule || !shippingRule.status) {
        return res.status(400).json({ success: false, message: "Valid shipping rule required" });
      }

      // 3. Evaluate Coupon
      let coupon = null;
      if (couponCode) {
        const foundCoupon = await prisma.coupon.findUnique({
          where: { code: couponCode },
        });
        if (
          foundCoupon &&
          foundCoupon.status &&
          new Date() >= foundCoupon.startDate &&
          new Date() <= foundCoupon.endDate
        ) {
          coupon = {
            code: foundCoupon.code,
            discountType: foundCoupon.discountType as "PERCENT" | "AMOUNT",
            discount: foundCoupon.discount,
          };
        }
      }

      // 4. Calculate amounts
      const subTotal = calculateSubTotal(items);
      const discount = calculateCouponDiscount(subTotal, coupon);
      const payableAmount = calculateFinalPayableAmount(
        subTotal,
        discount,
        shippingRule.cost
      );

      let paymentStatus: PaymentStatus = PaymentStatus.UNPAID;
      let transactionId = `txn_${Date.now()}`;
      let paidAmount = payableAmount;
      let paidCurrencyName = "USD";

      // 5. Handle Payment Gateways
      if (paymentMethod === "COD") {
        paymentStatus = PaymentStatus.UNPAID;
        transactionId = `COD_${Date.now()}`;
      } else if (paymentMethod === "STRIPE") {
        const stripeSetting = await prisma.stripeSetting.findFirst();
        paidCurrencyName = stripeSetting?.currencyName || "USD";
        const rate = stripeSetting?.currencyRate || 1;
        paidAmount = convertToGatewayCurrency(payableAmount, rate);
        paymentStatus = PaymentStatus.PAID;
        transactionId = stripeToken || `ch_${Date.now()}`;
      } else if (paymentMethod === "RAZORPAY") {
        const razorpaySetting = await prisma.razorpaySetting.findFirst();
        paidCurrencyName = razorpaySetting?.currencyName || "INR";
        const rate = razorpaySetting?.currencyRate || 83.5;
        paidAmount = convertToGatewayCurrency(payableAmount, rate);
        paymentStatus = PaymentStatus.PAID;
        transactionId = razorpayPaymentId || `pay_${Date.now()}`;
      }

      // 6. Save order & execute transaction with immutable snapshots
      const order = await CheckoutService.storeOrder({
        userId,
        cartItems: items,
        addressSnapshot: address as any,
        shippingSnapshot: {
          id: shippingRule.id,
          name: shippingRule.name,
          cost: shippingRule.cost,
        },
        couponSnapshot: coupon,
        paymentMethod,
        paymentStatus,
        transactionId,
        paidAmount,
        paidCurrencyName,
      });

      return res.status(201).json({
        success: true,
        message: "Order placed successfully",
        data: {
          orderId: order.id,
          invoiceId: order.invoiceId,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Customer's Order History
   */
  static async getUserOrders(req: Request, res: Response) {
    try {
      const orders = await prisma.order.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: "desc" },
        include: {
          orderProducts: true,
          transaction: true,
        },
      });
      return res.json({ success: true, data: orders });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Track order by Invoice ID (Publicly accessible)
   */
  static async trackOrder(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;
      const order = await prisma.order.findUnique({
        where: { invoiceId: Number(invoiceId) },
        select: {
          id: true,
          invoiceId: true,
          orderStatus: true,
          paymentStatus: true,
          createdAt: true,
          updatedAt: true,
          orderProducts: {
            select: {
              productName: true,
              qty: true,
              unitPrice: true,
            },
          },
        },
      });

      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      return res.json({ success: true, data: order });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
