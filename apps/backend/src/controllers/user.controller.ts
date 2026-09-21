import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "@ecommerce/database";

export class UserController {
  /**
   * Get authenticated user profile
   */
  static async getProfile(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      return res.json({ success: true, data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update profile information
   */
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
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
        },
      });

      return res.json({
        success: true,
        message: "Profile updated successfully",
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update account password
   */
  static async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required",
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
      });

      if (!user || !user.password) {
        return res.status(400).json({
          success: false,
          message: "Account does not have a local password set",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password does not match",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await prisma.user.update({
        where: { id: req.user!.id },
        data: { password: hashedPassword },
      });

      return res.json({ success: true, message: "Password updated successfully" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Address Management
   */
  static async getAddresses(req: Request, res: Response) {
    try {
      const addresses = await prisma.userAddress.findMany({
        where: { userId: req.user!.id },
        orderBy: { isDefault: "desc" },
      });
      return res.json({ success: true, data: addresses });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createAddress(req: Request, res: Response) {
    try {
      const {
        name,
        email,
        phone,
        country,
        state,
        city,
        zipCode,
        address,
        addressType,
        isDefault,
      } = req.body;

      if (isDefault) {
        await prisma.userAddress.updateMany({
          where: { userId: req.user!.id },
          data: { isDefault: false },
        });
      }

      const newAddress = await prisma.userAddress.create({
        data: {
          userId: req.user!.id,
          name,
          email,
          phone,
          country,
          state,
          city,
          zipCode,
          address,
          addressType: addressType || "home",
          isDefault: Boolean(isDefault),
        },
      });

      return res.status(201).json({
        success: true,
        message: "Address created successfully",
        data: newAddress,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateAddress(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        name,
        email,
        phone,
        country,
        state,
        city,
        zipCode,
        address,
        addressType,
        isDefault,
      } = req.body;

      const existing = await prisma.userAddress.findFirst({
        where: { id, userId: req.user!.id },
      });
      if (!existing) {
        return res.status(404).json({ success: false, message: "Address not found" });
      }

      if (isDefault) {
        await prisma.userAddress.updateMany({
          where: { userId: req.user!.id },
          data: { isDefault: false },
        });
      }

      const updated = await prisma.userAddress.update({
        where: { id },
        data: {
          name,
          email,
          phone,
          country,
          state,
          city,
          zipCode,
          address,
          addressType,
          ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
        },
      });

      return res.json({
        success: true,
        message: "Address updated successfully",
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteAddress(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.userAddress.findFirst({
        where: { id, userId: req.user!.id },
      });
      if (!existing) {
        return res.status(404).json({ success: false, message: "Address not found" });
      }

      await prisma.userAddress.delete({ where: { id } });
      return res.json({ success: true, message: "Address removed successfully" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async setDefaultAddress(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.$transaction([
        prisma.userAddress.updateMany({
          where: { userId: req.user!.id },
          data: { isDefault: false },
        }),
        prisma.userAddress.update({
          where: { id },
          data: { isDefault: true },
        }),
      ]);

      return res.json({ success: true, message: "Default address updated" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Wishlist Management
   */
  static async getWishlist(req: Request, res: Response) {
    try {
      const wishlist = await prisma.wishlist.findMany({
        where: { userId: req.user!.id },
        include: {
          product: {
            include: {
              category: { select: { name: true, slug: true } },
              brand: { select: { name: true, slug: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json({ success: true, data: wishlist });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async addToWishlist(req: Request, res: Response) {
    try {
      const { productId } = req.params;

      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      const item = await prisma.wishlist.upsert({
        where: {
          userId_productId: {
            userId: req.user!.id,
            productId,
          },
        },
        update: {},
        create: {
          userId: req.user!.id,
          productId,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Product added to wishlist",
        data: item,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async removeFromWishlist(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      await prisma.wishlist.deleteMany({
        where: {
          userId: req.user!.id,
          productId,
        },
      });

      return res.json({ success: true, message: "Product removed from wishlist" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Product Reviews
   */
  static async getUserReviews(req: Request, res: Response) {
    try {
      const reviews = await prisma.productReview.findMany({
        where: { userId: req.user!.id },
        include: {
          product: { select: { id: true, name: true, slug: true, thumbImage: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json({ success: true, data: reviews });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createReview(req: Request, res: Response) {
    try {
      const { productId, rating, review } = req.body;

      if (!productId || !rating || !review) {
        return res.status(400).json({
          success: false,
          message: "Product ID, rating (1-5), and review text are required",
        });
      }

      const newReview = await prisma.productReview.create({
        data: {
          userId: req.user!.id,
          productId,
          rating: Number(rating),
          review,
          status: false, // Pending admin moderation
        },
      });

      return res.status(201).json({
        success: true,
        message: "Review submitted for moderation",
        data: newReview,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Vendor Application
   */
  static async getVendorRequestStatus(req: Request, res: Response) {
    try {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user!.id },
      });

      const condition = await prisma.vendorCondition.findFirst();

      return res.json({
        success: true,
        data: {
          application: vendor,
          condition: condition?.content || null,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async submitVendorRequest(req: Request, res: Response) {
    try {
      const {
        shopName,
        phone,
        email,
        address,
        description,
        banner,
        fbLink,
        twLink,
        instaLink,
      } = req.body;

      const existing = await prisma.vendor.findUnique({
        where: { userId: req.user!.id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: existing.status
            ? "You are already an approved vendor"
            : "You already have a vendor application pending review",
        });
      }

      const vendor = await prisma.vendor.create({
        data: {
          userId: req.user!.id,
          shopName,
          phone,
          email,
          address,
          description,
          banner,
          fbLink,
          twLink,
          instaLink,
          status: false, // Pending admin approval
        },
      });

      return res.status(201).json({
        success: true,
        message: "Vendor application submitted successfully",
        data: vendor,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
