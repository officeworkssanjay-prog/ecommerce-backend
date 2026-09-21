import { Request, Response } from "express";
import {
  prisma,
  OrderStatus,
  PaymentStatus,
  WithdrawStatus,
  Role,
} from "@ecommerce/database";

export class AdminController {
  /**
   * Executive Dashboard Analytics
   */
  static async getDashboard(req: Request, res: Response) {
    try {
      const [
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders,
        pendingProducts,
        pendingWithdrawals,
        revenueData,
      ] = await Promise.all([
        prisma.user.count({ where: { role: Role.USER } }),
        prisma.vendor.count({ where: { status: true } }),
        prisma.product.count({ where: { status: true } }),
        prisma.order.count(),
        prisma.product.count({ where: { isApproved: false } }),
        prisma.withdrawRequest.count({ where: { status: WithdrawStatus.PENDING } }),
        prisma.order.aggregate({
          _sum: { amount: true },
          where: { paymentStatus: PaymentStatus.PAID },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          totalUsers,
          totalVendors,
          totalProducts,
          totalOrders,
          pendingProducts,
          pendingWithdrawals,
          totalRevenue: revenueData._sum.amount || 0,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Pending Seller Products Moderation Queue
   */
  static async getPendingProducts(req: Request, res: Response) {
    try {
      const products = await prisma.product.findMany({
        where: { isApproved: false },
        include: {
          vendor: { select: { shopName: true, email: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return res.json({ success: true, data: products });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Approve or reject seller product
   */
  static async updateProductApproval(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isApproved } = req.body;

      const product = await prisma.product.update({
        where: { id },
        data: { isApproved: Boolean(isApproved) },
      });

      return res.json({
        success: true,
        message: `Product ${isApproved ? "approved" : "unapproved"} successfully`,
        data: product,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Orders list with filters
   */
  static async getOrders(req: Request, res: Response) {
    try {
      const { status } = req.query;
      const where: any = {};
      if (status && typeof status === "string") {
        where.orderStatus = status as OrderStatus;
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          orderProducts: true,
          transaction: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json({ success: true, data: orders });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Global Logistics State Machine: Admin can transition order across all 7 statuses
   */
  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { orderStatus, paymentStatus } = req.body;

      const data: any = {};
      if (orderStatus) data.orderStatus = orderStatus as OrderStatus;
      if (paymentStatus) data.paymentStatus = paymentStatus as PaymentStatus;

      const order = await prisma.order.update({
        where: { id },
        data,
      });

      return res.json({
        success: true,
        message: "Order status updated successfully",
        data: order,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Merchant Payout Requests list
   */
  static async getWithdrawals(req: Request, res: Response) {
    try {
      const withdrawals = await prisma.withdrawRequest.findMany({
        include: {
          vendor: { select: { shopName: true, email: true } },
          method: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return res.json({ success: true, data: withdrawals });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Approve or decline payout request
   */
  static async updateWithdrawalStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body; // "PAID" or "DECLINED"

      const withdrawal = await prisma.withdrawRequest.update({
        where: { id },
        data: { status: status as WithdrawStatus },
      });

      return res.json({
        success: true,
        message: `Withdrawal marked as ${status}`,
        data: withdrawal,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Vendor Applications Queue
   */
  static async getVendorRequests(req: Request, res: Response) {
    try {
      const requests = await prisma.vendor.findMany({
        where: { status: false },
        include: { user: { select: { name: true, email: true } } },
      });
      return res.json({ success: true, data: requests });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Approve vendor application and elevate user role
   */
  static async approveVendor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { approve } = req.body;

      const vendor = await prisma.vendor.findUnique({ where: { id } });
      if (!vendor) {
        return res.status(404).json({ success: false, message: "Vendor application not found" });
      }

      if (approve) {
        await prisma.$transaction([
          prisma.vendor.update({
            where: { id },
            data: { status: true },
          }),
          prisma.user.update({
            where: { id: vendor.userId },
            data: { role: Role.VENDOR },
          }),
        ]);
        return res.json({ success: true, message: "Vendor approved and role updated" });
      } else {
        await prisma.vendor.delete({ where: { id } });
        return res.json({ success: true, message: "Vendor application rejected" });
      }
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
