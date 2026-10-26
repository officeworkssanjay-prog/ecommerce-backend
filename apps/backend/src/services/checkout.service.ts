import { prisma, PaymentStatus, OrderStatus } from "@ecommerce/database";
import {
  calculateSubTotal,
  calculateCouponDiscount,
  calculateFinalPayableAmount,
  CartLineItem,
  AppliedCoupon,
  AppliedShipping,
} from "../utils/pricing.util";

export interface CheckoutExecutionParams {
  userId: string;
  cartItems: CartLineItem[];
  addressSnapshot: Record<string, any>;
  shippingSnapshot: AppliedShipping;
  couponSnapshot?: AppliedCoupon | null;
  paymentMethod: string; // "STRIPE", "PAYPAL", "RAZORPAY", "COD"
  paymentStatus: PaymentStatus;
  transactionId: string;
  paidAmount: number;
  paidCurrencyName: string;
}

export class CheckoutService {
  /**
   * Executes atomic order creation, immutable snapshotting, inventory decrement, and transaction ledger.
   * Matches Laravel PaymentController::storeOrder() logic.
   */
  static async storeOrder(params: CheckoutExecutionParams) {
    const {
      userId,
      cartItems,
      addressSnapshot,
      shippingSnapshot,
      couponSnapshot,
      paymentMethod,
      paymentStatus,
      transactionId,
      paidAmount,
      paidCurrencyName,
    } = params;

    // 1. Calculate financial amounts
    const subTotal = calculateSubTotal(cartItems);
    const discount = calculateCouponDiscount(subTotal, couponSnapshot);
    const finalAmount = calculateFinalPayableAmount(
      subTotal,
      discount,
      shippingSnapshot.cost
    );

    // 2. Fetch platform general settings for currency
    const generalSetting = await prisma.generalSetting.findFirst();
    const currencyName = generalSetting?.currencyName || "USD";
    const currencyIcon = generalSetting?.currencyIcon || "$";

    // 3. Generate random 6-digit invoice id
    const invoiceId = Math.floor(100000 + Math.random() * 900000);

    // 4. Execute atomic transaction
    return await prisma.$transaction(async (tx: any) => {
      // Create master Order with JSON snapshots
      const order = await tx.order.create({
        data: {
          invoiceId,
          userId,
          subTotal,
          amount: finalAmount,
          currencyName,
          currencyIcon,
          productQty: cartItems.length,
          paymentMethod,
          paymentStatus,
          orderStatus: OrderStatus.PENDING,
          orderAddress: addressSnapshot,
          shippingMethod: shippingSnapshot as any,
          coupon: couponSnapshot
            ? {
                ...couponSnapshot,
                calculatedDiscount: discount,
              }
            : undefined,
        },
      });

      // Process line items & auto-decrement inventory
      for (const item of cartItems) {
        const targetId = item.productId || item.id;
        let product = await tx.product.findUnique({
          where: { id: targetId },
        });

        if (!product) {
          // Fallback lookup by slug or name if id not matched
          product = await tx.product.findFirst({
            where: {
              OR: [
                { slug: (item as any).slug || "" },
                { name: item.name },
              ],
            },
          });
        }

        // If product found, verify stock and decrement
        const actualProductId = product?.id || targetId;

        if (product) {
          if (product.qty >= item.qty) {
            await tx.product.update({
              where: { id: product.id },
              data: {
                qty: {
                  decrement: item.qty,
                },
              },
            });
          }
        }

        // Insert OrderProduct snapshot
        await tx.orderProduct.create({
          data: {
            orderId: order.id,
            productId: actualProductId,
            productName: item.name,
            unitPrice: item.price,
            qty: item.qty,
            variantTotal: item.variantTotal || 0,
            variants: item.variants || {},
          },
        });
      }


      // Record financial Transaction ledger
      await tx.transaction.create({
        data: {
          orderId: order.id,
          transactionId,
          paymentMethod,
          amount: finalAmount,
          amountRealCurrency: paidAmount,
          amountRealCurrencyName: paidCurrencyName,
        },
      });

      return order;
    });
  }
}
