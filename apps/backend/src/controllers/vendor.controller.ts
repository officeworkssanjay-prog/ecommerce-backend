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

      const totalEarnings = earningsData.reduce(
        (sum: number, item: { unitPrice: number; variantTotal: number; qty: number }) => {
          return sum + (item.unitPrice + item.variantTotal) * item.qty;
        },
        0
      );

      // Deduct withdrawals (approved + pending)
      const withdrawals = await prisma.withdrawRequest.findMany({
        where: {
          vendorId,
          status: { in: [WithdrawStatus.PENDING, WithdrawStatus.PAID] },
        },
        select: { totalAmount: true },
      });

      const totalWithdrawn = withdrawals.reduce(
        (sum: number, w: { totalAmount: number }) => sum + w.totalAmount,
        0
      );
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

  /**
   * Vendor User Profile
   */
  static async getProfile(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { id: true, name: true, email: true, phone: true, avatar: true },
      });
      return res.json({ success: true, data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const { name, phone, avatar } = req.body;
      const updated = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          ...(name && { name }),
          ...(phone !== undefined && { phone }),
          ...(avatar !== undefined && { avatar }),
        },
        select: { id: true, name: true, email: true, phone: true, avatar: true },
      });
      return res.json({ success: true, message: "Profile updated successfully", data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Vendor Shop Profile
   */
  static async getShopProfile(req: Request, res: Response) {
    try {
      const vendorId = req.user!.vendorId!;
      const shop = await prisma.vendor.findUnique({
        where: { id: vendorId },
      });
      return res.json({ success: true, data: shop });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateShopProfile(req: Request, res: Response) {
    try {
      const vendorId = req.user!.vendorId!;
      const {
        shopName,
        banner,
        phone,
        email,
        address,
        description,
        fbLink,
        twLink,
        instaLink,
      } = req.body;

      const updated = await prisma.vendor.update({
        where: { id: vendorId },
        data: {
          ...(shopName && { shopName }),
          ...(banner !== undefined && { banner }),
          ...(phone !== undefined && { phone }),
          ...(email !== undefined && { email }),
          ...(address !== undefined && { address }),
          ...(description !== undefined && { description }),
          ...(fbLink !== undefined && { fbLink }),
          ...(twLink !== undefined && { twLink }),
          ...(instaLink !== undefined && { instaLink }),
        },
      });

      return res.json({ success: true, message: "Shop profile updated", data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Cascading Category Selectors
   */
  static async getSubCategories(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const subCategories = await prisma.subCategory.findMany({
        where: { categoryId, status: true },
        orderBy: { name: "asc" },
      });
      return res.json({ success: true, data: subCategories });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getChildCategories(req: Request, res: Response) {
    try {
      const { subCategoryId } = req.params;
      const childCategories = await prisma.childCategory.findMany({
        where: { subCategoryId, status: true },
        orderBy: { name: "asc" },
      });
      return res.json({ success: true, data: childCategories });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Toggle Product Active Status
   */
  static async updateProductStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const vendorId = req.user!.vendorId!;

      const product = await prisma.product.findFirst({
        where: { id, vendorId },
      });

      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      const updated = await prisma.product.update({
        where: { id },
        data: { status: Boolean(status) },
      });

      return res.json({ success: true, message: "Product status updated", data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Product Variants Management
   */
  static async getProductVariants(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const vendorId = req.user!.vendorId!;

      const product = await prisma.product.findFirst({
        where: { id: productId, vendorId },
      });
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      const variants = await prisma.productVariant.findMany({
        where: { productId },
        include: { items: true },
      });

      return res.json({ success: true, data: variants });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createProductVariant(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { name, status } = req.body;
      const vendorId = req.user!.vendorId!;

      const product = await prisma.product.findFirst({
        where: { id: productId, vendorId },
      });
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      const variant = await prisma.productVariant.create({
        data: {
          productId,
          name,
          status: status !== undefined ? Boolean(status) : true,
        },
      });

      return res.status(201).json({ success: true, message: "Variant created", data: variant });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateProductVariant(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, status } = req.body;
      const vendorId = req.user!.vendorId!;

      const variant = await prisma.productVariant.findUnique({
        where: { id },
        include: { product: true },
      });

      if (!variant || variant.product.vendorId !== vendorId) {
        return res.status(404).json({ success: false, message: "Variant not found" });
      }

      const updated = await prisma.productVariant.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(status !== undefined && { status: Boolean(status) }),
        },
      });

      return res.json({ success: true, message: "Variant updated", data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteProductVariant(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const vendorId = req.user!.vendorId!;

      const variant = await prisma.productVariant.findUnique({
        where: { id },
        include: { product: true },
      });

      if (!variant || variant.product.vendorId !== vendorId) {
        return res.status(404).json({ success: false, message: "Variant not found" });
      }

      await prisma.productVariant.delete({ where: { id } });
      return res.json({ success: true, message: "Variant removed" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Variant Items Management
   */
  static async getVariantItems(req: Request, res: Response) {
    try {
      const { variantId } = req.params;
      const items = await prisma.productVariantItem.findMany({
        where: { productVariantId: variantId },
      });
      return res.json({ success: true, data: items });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createVariantItem(req: Request, res: Response) {
    try {
      const { variantId } = req.params;
      const { name, price, isDefault, status } = req.body;

      const item = await prisma.productVariantItem.create({
        data: {
          productVariantId: variantId,
          name,
          price: Number(price) || 0,
          isDefault: Boolean(isDefault),
          status: status !== undefined ? Boolean(status) : true,
        },
      });

      return res.status(201).json({ success: true, message: "Variant item created", data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateVariantItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, price, isDefault, status } = req.body;

      const updated = await prisma.productVariantItem.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(price !== undefined && { price: Number(price) }),
          ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
          ...(status !== undefined && { status: Boolean(status) }),
        },
      });

      return res.json({ success: true, message: "Variant item updated", data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteVariantItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.productVariantItem.delete({ where: { id } });
      return res.json({ success: true, message: "Variant item deleted" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Product Secondary Image Gallery
   */
  static async getGalleryImages(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const images = await prisma.productImageGallery.findMany({
        where: { productId },
      });
      return res.json({ success: true, data: images });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async addGalleryImage(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({ success: false, message: "Image URL required" });
      }

      const newImage = await prisma.productImageGallery.create({
        data: { productId, image },
      });

      return res.status(201).json({
        success: true,
        message: "Gallery image added",
        data: newImage,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteGalleryImage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.productImageGallery.delete({ where: { id } });
      return res.json({ success: true, message: "Gallery image removed" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Vendor Product Reviews
   */
  static async getVendorReviews(req: Request, res: Response) {
    try {
      const vendorId = req.user!.vendorId!;
      const reviews = await prisma.productReview.findMany({
        where: { product: { vendorId }, status: true },
        include: {
          product: { select: { name: true, slug: true, thumbImage: true } },
          user: { select: { name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json({ success: true, data: reviews });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Available Withdrawal Payout Methods
   */
  static async getWithdrawMethods(req: Request, res: Response) {
    try {
      const methods = await prisma.withdrawMethod.findMany({
        where: { status: true },
      });
      return res.json({ success: true, data: methods });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

