import { Request, Response } from "express";
import { prisma, OrderStatus, PaymentStatus, WithdrawStatus } from "@ecommerce/database";

export class VendorController {
  /**
   * Vendor Dashboard metrics
   */
  static async getDashboard(req: Request, res: Response) {
    try {
      const vendorId = req.user!.vendorId;
      if (!vendorId) {
        return res.status(403).json({ success: false, message: "Vendor profile not found" });
      }

      const [totalProducts, totalOrders, earningsData] = await Promise.all([
        prisma.product.count({ where: { vendorId } }),
        prisma.orderProduct.count({ where: { vendorId } }),
        // Delivered + Paid earnings
        prisma.orderProduct.findMany({
          where: {
            vendorId,
            order: {
              paymentStatus: PaymentStatus.PAID,
              orderStatus: OrderStatus.DELIVERED,
            },
          },
          select: { unitPrice: true, qty: true, variantTotal: true },
        }),
      ]);

      const totalEarnings = earningsData.reduce((sum, item) => {
        return sum + (item.unitPrice + item.variantTotal) * item.qty;
      }, 0);

      // Deduct withdrawals (approved + pending)
      const withdrawals = await prisma.withdrawRequest.findMany({
        where: {
          vendorId,
          status: { in: [WithdrawStatus.PENDING, WithdrawStatus.PAID] },
        },
        select: { totalAmount: true },
      });

      const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.totalAmount, 0);
      const currentBalance = Math.max(0, totalEarnings - totalWithdrawn);

      return res.json({
        success: true,
        data: {
          totalProducts,
          totalOrders,
          totalEarnings: Number(totalEarnings.toFixed(2)),
          totalWithdrawn: Number(totalWithdrawn.toFixed(2)),
          currentBalance: Number(currentBalance.toFixed(2)),
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Vendor Products List
   */
  static async getProducts(req: Request, res: Response) {
    try {
      const vendorId = req.user!.vendorId!;
      const products = await prisma.product.findMany({
        where: { vendorId },
        include: {
          category: { select: { name: true } },
          variants: { include: { items: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return res.json({ success: true, data: products });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Create Vendor Product (Saved with isApproved = false)
   */
  static async createProduct(req: Request, res: Response) {
    try {
      const vendorId = req.user!.vendorId!;
      const {
        name,
        categoryId,
        subCategoryId,
        childCategoryId,
        brandId,
        qty,
        shortDescription,
        longDescription,
        price,
        offerPrice,
        offerStartDate,
        offerEndDate,
        productType,
        thumbImage,
      } = req.body;

      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

      const product = await prisma.product.create({
        data: {
          vendorId,
          name,
          slug,
          categoryId,
          subCategoryId,
          childCategoryId,
          brandId,
          qty: Number(qty),
          shortDescription,
          longDescription,
          price: Number(price),
          offerPrice: offerPrice ? Number(offerPrice) : null,
          offerStartDate: offerStartDate ? new Date(offerStartDate) : null,
          offerEndDate: offerEndDate ? new Date(offerEndDate) : null,
          productType,
          thumbImage: thumbImage || "/placeholder.png",
          isApproved: false, // Must be approved by Admin
          status: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Product submitted for administrative approval",
        data: product,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Vendor Orders
   */
  static async getOrders(req: Request, res: Response) {
    try {
      const vendorId = req.user!.vendorId!;
      const orderProducts = await prisma.orderProduct.findMany({
        where: { vendorId },
        include: {
          order: {
            select: {
              invoiceId: true,
              orderStatus: true,
              paymentStatus: true,
              orderAddress: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return res.json({ success: true, data: orderProducts });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Vendor can update order status ONLY to PROCESSED_AND_READY_TO_SHIP
   */
  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const vendorId = req.user!.vendorId!;

      // Verify vendor has items in this order
      const hasItem = await prisma.orderProduct.findFirst({
        where: { orderId, vendorId },
      });
      if (!hasItem) {
        return res.status(403).json({ success: false, message: "Order not found for this vendor" });
      }

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: OrderStatus.PROCESSED_AND_READY_TO_SHIP },
      });

      return res.json({
        success: true,
        message: "Order marked as processed and ready to ship",
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Submit Withdrawal Request
   */
  static async requestWithdrawal(req: Request, res: Response) {
    try {
      const vendorId = req.user!.vendorId!;
      const { methodId, amount, accountInfo } = req.body;

      // 1. Check for pending requests
      const pendingRequest = await prisma.withdrawRequest.findFirst({
        where: { vendorId, status: WithdrawStatus.PENDING },
      });
      if (pendingRequest) {
        return res.status(400).json({
          success: false,
          message: "You already have a pending withdrawal request under review",
        });
      }

      // 2. Validate Method and Limits
      const method = await prisma.withdrawMethod.findUnique({ where: { id: methodId } });
      if (!method || !method.status) {
        return res.status(400).json({ success: false, message: "Invalid payout method" });
      }

      if (amount < method.minimumAmount || amount > method.maximumAmount) {
        return res.status(400).json({
          success: false,
          message: `Withdrawal amount must be between ${method.minimumAmount} and ${method.maximumAmount}`,
        });
      }

      // 3. Calculate Platform Fee
      const withdrawCharge = (amount * method.withdrawChargePercent) / 100;
      const finalAmount = amount - withdrawCharge;

      const request = await prisma.withdrawRequest.create({
        data: {
          vendorId,
          methodId,
          totalAmount: amount,
          withdrawCharge,
          finalAmount,
          accountInfo,
          status: WithdrawStatus.PENDING,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Withdrawal request submitted successfully",
        data: request,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
