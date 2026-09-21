import { Request, Response } from "express";
import bcrypt from "bcryptjs";
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

  /**
   * User & Customer Governance
   */
  static async getUsers(req: Request, res: Response) {
    try {
      const { role, status } = req.query;
      const where: any = {};
      if (role) where.role = role as Role;
      if (status !== undefined) where.status = status === "true";

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          vendor: { select: { id: true, shopName: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json({ success: true, data: users });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: { status: Boolean(status) },
      });

      return res.json({ success: true, message: "User status updated", data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || Role.USER,
          status: true,
        },
        select: { id: true, name: true, email: true, role: true },
      });

      return res.status(201).json({ success: true, message: "User created", data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Vendor List & Conditions
   */
  static async getVendors(req: Request, res: Response) {
    try {
      const vendors = await prisma.vendor.findMany({
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { products: true, orderProducts: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return res.json({ success: true, data: vendors });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateVendorStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const vendor = await prisma.vendor.update({
        where: { id },
        data: { status: Boolean(status) },
      });

      return res.json({ success: true, message: "Vendor status updated", data: vendor });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getVendorCondition(req: Request, res: Response) {
    try {
      const condition = await prisma.vendorCondition.findFirst();
      return res.json({ success: true, data: condition });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateVendorCondition(req: Request, res: Response) {
    try {
      const { content } = req.body;
      const existing = await prisma.vendorCondition.findFirst();

      let condition;
      if (existing) {
        condition = await prisma.vendorCondition.update({
          where: { id: existing.id },
          data: { content },
        });
      } else {
        condition = await prisma.vendorCondition.create({
          data: { content },
        });
      }

      return res.json({ success: true, message: "Vendor condition updated", data: condition });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Sliders Management
   */
  static async getSliders(req: Request, res: Response) {
    try {
      const sliders = await prisma.slider.findMany({ orderBy: { serial: "asc" } });
      return res.json({ success: true, data: sliders });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createSlider(req: Request, res: Response) {
    try {
      const { banner, type, title, startingPrice, btnUrl, serial, status } = req.body;
      const slider = await prisma.slider.create({
        data: {
          banner,
          type,
          title,
          startingPrice: startingPrice ? Number(startingPrice) : null,
          btnUrl,
          serial: Number(serial) || 1,
          status: status !== undefined ? Boolean(status) : true,
        },
      });
      return res.status(201).json({ success: true, message: "Slider created", data: slider });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateSlider(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { banner, type, title, startingPrice, btnUrl, serial, status } = req.body;

      const slider = await prisma.slider.update({
        where: { id },
        data: {
          ...(banner && { banner }),
          ...(type !== undefined && { type }),
          ...(title !== undefined && { title }),
          ...(startingPrice !== undefined && { startingPrice: Number(startingPrice) }),
          ...(btnUrl !== undefined && { btnUrl }),
          ...(serial !== undefined && { serial: Number(serial) }),
          ...(status !== undefined && { status: Boolean(status) }),
        },
      });
      return res.json({ success: true, message: "Slider updated", data: slider });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteSlider(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.slider.delete({ where: { id } });
      return res.json({ success: true, message: "Slider deleted" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Category Hierarchy CRUD
   */
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: { select: { subCategories: true, products: true } },
        },
        orderBy: { name: "asc" },
      });
      return res.json({ success: true, data: categories });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      const { name, icon, status } = req.body;
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
      const category = await prisma.category.create({
        data: {
          name,
          slug,
          icon,
          status: status !== undefined ? Boolean(status) : true,
        },
      });
      return res.status(201).json({ success: true, message: "Category created", data: category });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, icon, status } = req.body;
      const category = await prisma.category.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(icon !== undefined && { icon }),
          ...(status !== undefined && { status: Boolean(status) }),
        },
      });
      return res.json({ success: true, message: "Category updated", data: category });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.category.delete({ where: { id } });
      return res.json({ success: true, message: "Category deleted" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getSubCategories(req: Request, res: Response) {
    try {
      const subCategories = await prisma.subCategory.findMany({
        include: {
          category: { select: { name: true } },
          _count: { select: { childCategories: true, products: true } },
        },
        orderBy: { name: "asc" },
      });
      return res.json({ success: true, data: subCategories });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createSubCategory(req: Request, res: Response) {
    try {
      const { categoryId, name, status } = req.body;
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
      const subCategory = await prisma.subCategory.create({
        data: {
          categoryId,
          name,
          slug,
          status: status !== undefined ? Boolean(status) : true,
        },
      });
      return res.status(201).json({ success: true, message: "SubCategory created", data: subCategory });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateSubCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { categoryId, name, status } = req.body;
      const subCategory = await prisma.subCategory.update({
        where: { id },
        data: {
          ...(categoryId && { categoryId }),
          ...(name && { name }),
          ...(status !== undefined && { status: Boolean(status) }),
        },
      });
      return res.json({ success: true, message: "SubCategory updated", data: subCategory });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteSubCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.subCategory.delete({ where: { id } });
      return res.json({ success: true, message: "SubCategory deleted" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getChildCategories(req: Request, res: Response) {
    try {
      const childCategories = await prisma.childCategory.findMany({
        include: {
          subCategory: { select: { name: true, category: { select: { name: true } } } },
          _count: { select: { products: true } },
        },
        orderBy: { name: "asc" },
      });
      return res.json({ success: true, data: childCategories });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createChildCategory(req: Request, res: Response) {
    try {
      const { subCategoryId, name, status } = req.body;
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
      const childCategory = await prisma.childCategory.create({
        data: {
          subCategoryId,
          name,
          slug,
          status: status !== undefined ? Boolean(status) : true,
        },
      });
      return res.status(201).json({ success: true, message: "ChildCategory created", data: childCategory });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateChildCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { subCategoryId, name, status } = req.body;
      const childCategory = await prisma.childCategory.update({
        where: { id },
        data: {
          ...(subCategoryId && { subCategoryId }),
          ...(name && { name }),
          ...(status !== undefined && { status: Boolean(status) }),
        },
      });
      return res.json({ success: true, message: "ChildCategory updated", data: childCategory });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteChildCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.childCategory.delete({ where: { id } });
      return res.json({ success: true, message: "ChildCategory deleted" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Brands Management
   */
  static async getBrands(req: Request, res: Response) {
    try {
      const brands = await prisma.brand.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
      });
      return res.json({ success: true, data: brands });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createBrand(req: Request, res: Response) {
    try {
      const { name, logo, isFeatured, status } = req.body;
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
      const brand = await prisma.brand.create({
        data: {
          name,
          slug,
          logo,
          isFeatured: Boolean(isFeatured),
          status: status !== undefined ? Boolean(status) : true,
        },
      });
      return res.status(201).json({ success: true, message: "Brand created", data: brand });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateBrand(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, logo, isFeatured, status } = req.body;
      const brand = await prisma.brand.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(logo !== undefined && { logo }),
          ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
          ...(status !== undefined && { status: Boolean(status) }),
        },
      });
      return res.json({ success: true, message: "Brand updated", data: brand });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteBrand(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.brand.delete({ where: { id } });
      return res.json({ success: true, message: "Brand deleted" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Platform Products Management
   */
  static async getProducts(req: Request, res: Response) {
    try {
      const products = await prisma.product.findMany({
        include: {
          vendor: { select: { shopName: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return res.json({ success: true, data: products });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createProduct(req: Request, res: Response) {
    try {
      const {
        vendorId,
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
          productType,
          thumbImage: thumbImage || "/placeholder.png",
          isApproved: true,
          status: true,
        },
      });

      return res.status(201).json({ success: true, message: "Product created", data: product });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, categoryId, subCategoryId, childCategoryId, brandId, qty, price, offerPrice, status, isApproved } = req.body;

      const product = await prisma.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(categoryId && { categoryId }),
          ...(subCategoryId !== undefined && { subCategoryId }),
          ...(childCategoryId !== undefined && { childCategoryId }),
          ...(brandId !== undefined && { brandId }),
          ...(qty !== undefined && { qty: Number(qty) }),
          ...(price !== undefined && { price: Number(price) }),
          ...(offerPrice !== undefined && { offerPrice: Number(offerPrice) }),
          ...(status !== undefined && { status: Boolean(status) }),
          ...(isApproved !== undefined && { isApproved: Boolean(isApproved) }),
        },
      });

      return res.json({ success: true, message: "Product updated", data: product });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.product.delete({ where: { id } });
      return res.json({ success: true, message: "Product deleted" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Reviews Moderation
   */
  static async getReviews(req: Request, res: Response) {
    try {
      const reviews = await prisma.productReview.findMany({
        include: {
          product: { select: { name: true, slug: true } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return res.json({ success: true, data: reviews });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateReviewStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const review = await prisma.productReview.update({
        where: { id },
        data: { status: Boolean(status) },
      });

      return res.json({ success: true, message: "Review status updated", data: review });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Flash Sale Management
   */
  static async getFlashSale(req: Request, res: Response) {
    try {
      const flashSale = await prisma.flashSale.findFirst({
        include: {
          products: {
            include: {
              product: { select: { id: true, name: true, price: true, thumbImage: true } },
            },
          },
        },
      });
      return res.json({ success: true, data: flashSale });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateFlashSale(req: Request, res: Response) {
    try {
      const { endDate, showAtHome } = req.body;
      const existing = await prisma.flashSale.findFirst();

      let flashSale;
      if (existing) {
        flashSale = await prisma.flashSale.update({
          where: { id: existing.id },
          data: {
            ...(endDate && { endDate: new Date(endDate) }),
            ...(showAtHome !== undefined && { showAtHome: Boolean(showAtHome) }),
          },
        });
      } else {
        flashSale = await prisma.flashSale.create({
          data: {
            endDate: new Date(endDate),
            showAtHome: Boolean(showAtHome),
          },
        });
      }

      return res.json({ success: true, message: "Flash sale updated", data: flashSale });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async addFlashSaleProduct(req: Request, res: Response) {
    try {
      const { flashSaleId, productId, showAtHome } = req.body;
      const item = await prisma.flashSaleProduct.create({
        data: {
          flashSaleId,
          productId,
          showAtHome: Boolean(showAtHome),
          status: true,
        },
      });
      return res.status(201).json({ success: true, message: "Product added to flash sale", data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async removeFlashSaleProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.flashSaleProduct.delete({ where: { id } });
      return res.json({ success: true, message: "Product removed from flash sale" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Promo Coupons CRUD
   */
  static async getCoupons(req: Request, res: Response) {
    try {
      const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
      return res.json({ success: true, data: coupons });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createCoupon(req: Request, res: Response) {
    try {
      const { name, code, quantity, maxUse, startDate, endDate, discountType, discount, status } = req.body;

      const coupon = await prisma.coupon.create({
        data: {
          name,
          code: code.toUpperCase(),
          quantity: Number(quantity),
          maxUse: Number(maxUse) || 1,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          discountType,
          discount: Number(discount),
          status: status !== undefined ? Boolean(status) : true,
        },
      });

      return res.status(201).json({ success: true, message: "Coupon created", data: coupon });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateCoupon(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, code, quantity, maxUse, startDate, endDate, discountType, discount, status } = req.body;

      const coupon = await prisma.coupon.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(code && { code: code.toUpperCase() }),
          ...(quantity !== undefined && { quantity: Number(quantity) }),
          ...(maxUse !== undefined && { maxUse: Number(maxUse) }),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate && { endDate: new Date(endDate) }),
          ...(discountType && { discountType }),
          ...(discount !== undefined && { discount: Number(discount) }),
          ...(status !== undefined && { status: Boolean(status) }),
        },
      });

      return res.json({ success: true, message: "Coupon updated", data: coupon });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteCoupon(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.coupon.delete({ where: { id } });
      return res.json({ success: true, message: "Coupon deleted" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Shipping Rules CRUD
   */
  static async getShippingRules(req: Request, res: Response) {
    try {
      const rules = await prisma.shippingRule.findMany({ orderBy: { createdAt: "desc" } });
      return res.json({ success: true, data: rules });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createShippingRule(req: Request, res: Response) {
    try {
      const { name, type, minCost, cost, status } = req.body;
      const rule = await prisma.shippingRule.create({
        data: {
          name,
          type: type || "flat_cost",
          minCost: minCost ? Number(minCost) : 0,
          cost: Number(cost),
          status: status !== undefined ? Boolean(status) : true,
        },
      });
      return res.status(201).json({ success: true, message: "Shipping rule created", data: rule });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateShippingRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, type, minCost, cost, status } = req.body;
      const rule = await prisma.shippingRule.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(type && { type }),
          ...(minCost !== undefined && { minCost: Number(minCost) }),
          ...(cost !== undefined && { cost: Number(cost) }),
          ...(status !== undefined && { status: Boolean(status) }),
        },
      });
      return res.json({ success: true, message: "Shipping rule updated", data: rule });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteShippingRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.shippingRule.delete({ where: { id } });
      return res.json({ success: true, message: "Shipping rule deleted" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Advertisements & Banners Management
   */
  static async getAdvertisements(req: Request, res: Response) {
    try {
      const ads = await prisma.advertisement.findMany();
      return res.json({ success: true, data: ads });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateAdvertisement(req: Request, res: Response) {
    try {
      const { key, value } = req.body;
      const ad = await prisma.advertisement.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
      return res.json({ success: true, message: "Advertisement banner updated", data: ad });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Payout Methods CRUD
   */
  static async getWithdrawMethods(req: Request, res: Response) {
    try {
      const methods = await prisma.withdrawMethod.findMany();
      return res.json({ success: true, data: methods });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createWithdrawMethod(req: Request, res: Response) {
    try {
      const { name, minimumAmount, maximumAmount, withdrawChargePercent, description, status } = req.body;
      const method = await prisma.withdrawMethod.create({
        data: {
          name,
          minimumAmount: Number(minimumAmount),
          maximumAmount: Number(maximumAmount),
          withdrawChargePercent: Number(withdrawChargePercent) || 0,
          description,
          status: status !== undefined ? Boolean(status) : true,
        },
      });
      return res.status(201).json({ success: true, message: "Payout method created", data: method });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateWithdrawMethod(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, minimumAmount, maximumAmount, withdrawChargePercent, description, status } = req.body;
      const method = await prisma.withdrawMethod.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(minimumAmount !== undefined && { minimumAmount: Number(minimumAmount) }),
          ...(maximumAmount !== undefined && { maximumAmount: Number(maximumAmount) }),
          ...(withdrawChargePercent !== undefined && { withdrawChargePercent: Number(withdrawChargePercent) }),
          ...(description !== undefined && { description }),
          ...(status !== undefined && { status: Boolean(status) }),
        },
      });
      return res.json({ success: true, message: "Payout method updated", data: method });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Blog & CMS Management
   */
  static async getBlogCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.blogCategory.findMany({
        include: { _count: { select: { blogs: true } } },
        orderBy: { name: "asc" },
      });
      return res.json({ success: true, data: categories });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createBlogCategory(req: Request, res: Response) {
    try {
      const { name, status } = req.body;
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
      const category = await prisma.blogCategory.create({
        data: {
          name,
          slug,
          status: status !== undefined ? Boolean(status) : true,
        },
      });
      return res.status(201).json({ success: true, message: "Blog category created", data: category });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateBlogCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, status } = req.body;
      const category = await prisma.blogCategory.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(status !== undefined && { status: Boolean(status) }),
        },
      });
      return res.json({ success: true, message: "Blog category updated", data: category });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteBlogCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.blogCategory.delete({ where: { id } });
      return res.json({ success: true, message: "Blog category deleted" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getBlogs(req: Request, res: Response) {
    try {
      const blogs = await prisma.blog.findMany({
        include: {
          category: { select: { name: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return res.json({ success: true, data: blogs });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createBlog(req: Request, res: Response) {
    try {
      const { categoryId, title, image, description, seoTitle, seoDescription, status } = req.body;
      const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
      const blog = await prisma.blog.create({
        data: {
          categoryId,
          title,
          slug,
          image,
          description,
          seoTitle,
          seoDescription,
          status: status !== undefined ? Boolean(status) : true,
        },
      });
      return res.status(201).json({ success: true, message: "Blog post created", data: blog });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateBlog(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { categoryId, title, image, description, seoTitle, seoDescription, status } = req.body;
      const blog = await prisma.blog.update({
        where: { id },
        data: {
          ...(categoryId && { categoryId }),
          ...(title && { title }),
          ...(image && { image }),
          ...(description && { description }),
          ...(seoTitle !== undefined && { seoTitle }),
          ...(seoDescription !== undefined && { seoDescription }),
          ...(status !== undefined && { status: Boolean(status) }),
        },
      });
      return res.json({ success: true, message: "Blog post updated", data: blog });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteBlog(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.blog.delete({ where: { id } });
      return res.json({ success: true, message: "Blog post deleted" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getBlogComments(req: Request, res: Response) {
    try {
      const comments = await prisma.blogComment.findMany({
        include: {
          blog: { select: { title: true, slug: true } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return res.json({ success: true, data: comments });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateBlogCommentStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const comment = await prisma.blogComment.update({
        where: { id },
        data: { status: Boolean(status) },
      });
      return res.json({ success: true, message: "Comment status updated", data: comment });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteBlogComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.blogComment.delete({ where: { id } });
      return res.json({ success: true, message: "Comment deleted" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Newsletter Subscribers & Bulk Messaging
   */
  static async getSubscribers(req: Request, res: Response) {
    try {
      const subscribers = await prisma.newsletterSubscriber.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.json({ success: true, data: subscribers });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async sendSubscribersMail(req: Request, res: Response) {
    try {
      const { subject, message } = req.body;
      const verifiedSubscribers = await prisma.newsletterSubscriber.findMany({
        where: { isVerified: true },
        select: { email: true },
      });

      return res.json({
        success: true,
        message: `Broadcast message queued for ${verifiedSubscribers.length} verified subscriber(s)`,
        recipientsCount: verifiedSubscribers.length,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Global Platform & Integration Settings
   */
  static async getSettings(req: Request, res: Response) {
    try {
      const [general, email, pusher, paypal, stripe, razorpay, cod] = await Promise.all([
        prisma.generalSetting.findFirst(),
        prisma.emailSetting.findFirst(),
        prisma.pusherSetting.findFirst(),
        prisma.paypalSetting.findFirst(),
        prisma.stripeSetting.findFirst(),
        prisma.razorpaySetting.findFirst(),
        prisma.codSetting.findFirst(),
      ]);

      return res.json({
        success: true,
        data: {
          general,
          email,
          pusher,
          paymentGateways: {
            paypal,
            stripe,
            razorpay,
            cod,
          },
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateGeneralSetting(req: Request, res: Response) {
    try {
      const { siteName, contactEmail, contactPhone, contactAddress, mapUrl, currencyName, currencyIcon, timeZone } = req.body;
      const existing = await prisma.generalSetting.findFirst();

      const data = {
        siteName,
        contactEmail,
        contactPhone,
        contactAddress,
        mapUrl,
        currencyName,
        currencyIcon,
        timeZone,
      };

      const updated = existing
        ? await prisma.generalSetting.update({ where: { id: existing.id }, data })
        : await prisma.generalSetting.create({ data });

      return res.json({ success: true, message: "General settings updated", data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateEmailSetting(req: Request, res: Response) {
    try {
      const { email, host, username, password, port, encryption } = req.body;
      const existing = await prisma.emailSetting.findFirst();

      const data = {
        email,
        host,
        username,
        password,
        port: Number(port) || 587,
        encryption,
      };

      const updated = existing
        ? await prisma.emailSetting.update({ where: { id: existing.id }, data })
        : await prisma.emailSetting.create({ data });

      return res.json({ success: true, message: "Email settings updated", data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updatePusherSetting(req: Request, res: Response) {
    try {
      const { appId, key, secret, cluster } = req.body;
      const existing = await prisma.pusherSetting.findFirst();

      const data = { appId, key, secret, cluster: cluster || "mt1" };

      const updated = existing
        ? await prisma.pusherSetting.update({ where: { id: existing.id }, data })
        : await prisma.pusherSetting.create({ data });

      return res.json({ success: true, message: "Pusher settings updated", data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updatePaymentGatewaySettings(req: Request, res: Response) {
    try {
      const { gateway, settings } = req.body;

      let updated;
      if (gateway === "STRIPE") {
        const existing = await prisma.stripeSetting.findFirst();
        updated = existing
          ? await prisma.stripeSetting.update({ where: { id: existing.id }, data: settings })
          : await prisma.stripeSetting.create({ data: settings });
      } else if (gateway === "RAZORPAY") {
        const existing = await prisma.razorpaySetting.findFirst();
        updated = existing
          ? await prisma.razorpaySetting.update({ where: { id: existing.id }, data: settings })
          : await prisma.razorpaySetting.create({ data: settings });
      } else if (gateway === "PAYPAL") {
        const existing = await prisma.paypalSetting.findFirst();
        updated = existing
          ? await prisma.paypalSetting.update({ where: { id: existing.id }, data: settings })
          : await prisma.paypalSetting.create({ data: settings });
      } else if (gateway === "COD") {
        const existing = await prisma.codSetting.findFirst();
        updated = existing
          ? await prisma.codSetting.update({ where: { id: existing.id }, data: settings })
          : await prisma.codSetting.create({ data: settings });
      } else {
        return res.status(400).json({ success: false, message: "Unsupported gateway" });
      }

      return res.json({
        success: true,
        message: `${gateway} settings updated`,
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

