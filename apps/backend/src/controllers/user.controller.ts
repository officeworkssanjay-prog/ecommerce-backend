import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "@ecommerce/database";
import {
  AddressInput,
  ChangePasswordInput,
  CreateReviewInput,
  UpdateAddressInput,
  UpdateProfileInput,
} from "@ecommerce/shared-types";
import { AppError } from "../utils/errors";

const MAX_ADDRESSES = 10;

const profileSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatar: true,
  role: true,
} as const;

/** Handlers run behind `validate()` + `asyncHandler()`, so inputs are already parsed. */
export class UserController {
  static async getProfile(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { ...profileSelect, createdAt: true },
    });
    if (!user) throw AppError.notFound("User not found");
    return res.json({ success: true, data: user });
  }

  static async updateProfile(req: Request, res: Response) {
    const { name, phone, avatar } = req.body as UpdateProfileInput;
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone: phone === "" ? null : phone }),
        ...(avatar !== undefined && { avatar: avatar === "" ? null : avatar }),
      },
      select: profileSelect,
    });
    return res.json({ success: true, message: "Profile updated successfully", data: updated });
  }

  static async changePassword(req: Request, res: Response) {
    const { currentPassword, newPassword } = req.body as ChangePasswordInput;

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user || !user.password) {
      throw AppError.badRequest("Account does not have a local password set");
    }
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      throw AppError.badRequest("Current password does not match", { currentPassword: ["Current password does not match"] });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });
    return res.json({ success: true, message: "Password updated successfully" });
  }

  // ---------- Addresses (every query is scoped to the signed-in user) ----------
  static async getAddresses(req: Request, res: Response) {
    const addresses = await prisma.userAddress.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return res.json({ success: true, data: addresses });
  }

  static async createAddress(req: Request, res: Response) {
    const userId = req.user!.id;
    const { isDefault, ...fields } = req.body as AddressInput;

    const created = await prisma.$transaction(async (tx) => {
      const count = await tx.userAddress.count({ where: { userId } });
      if (count >= MAX_ADDRESSES) {
        throw AppError.badRequest(`You can save at most ${MAX_ADDRESSES} addresses`);
      }
      // The first address is always the default.
      const makeDefault = Boolean(isDefault) || count === 0;
      if (makeDefault) await tx.userAddress.updateMany({ where: { userId }, data: { isDefault: false } });
      return tx.userAddress.create({ data: { ...fields, userId, isDefault: makeDefault } });
    });

    return res.status(201).json({ success: true, message: "Address created successfully", data: created });
  }

  static async updateAddress(req: Request, res: Response) {
    const userId = req.user!.id;
    const { id } = req.params;
    const { isDefault, ...fields } = req.body as UpdateAddressInput;

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.userAddress.findFirst({ where: { id, userId } });
      if (!existing) throw AppError.notFound("Address not found");
      if (isDefault) await tx.userAddress.updateMany({ where: { userId }, data: { isDefault: false } });
      return tx.userAddress.update({
        where: { id },
        // A default address can't be demoted directly; set another one as default instead.
        data: { ...fields, ...(isDefault ? { isDefault: true } : {}) },
      });
    });

    return res.json({ success: true, message: "Address updated successfully", data: updated });
  }

  static async deleteAddress(req: Request, res: Response) {
    const userId = req.user!.id;
    const { id } = req.params;

    await prisma.$transaction(async (tx) => {
      const existing = await tx.userAddress.findFirst({ where: { id, userId } });
      if (!existing) throw AppError.notFound("Address not found");
      await tx.userAddress.delete({ where: { id } });
      if (existing.isDefault) {
        const next = await tx.userAddress.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
        if (next) await tx.userAddress.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    });

    return res.json({ success: true, message: "Address removed successfully" });
  }

  static async setDefaultAddress(req: Request, res: Response) {
    const userId = req.user!.id;
    const { id } = req.params;

    await prisma.$transaction(async (tx) => {
      const existing = await tx.userAddress.findFirst({ where: { id, userId } });
      if (!existing) throw AppError.notFound("Address not found");
      await tx.userAddress.updateMany({ where: { userId }, data: { isDefault: false } });
      await tx.userAddress.update({ where: { id }, data: { isDefault: true } });
    });

    return res.json({ success: true, message: "Default address updated" });
  }

  // ---------- Wishlist ----------
  static async getWishlist(req: Request, res: Response) {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          include: {
            category: { select: { name: true, slug: true } },
            brand: { select: { name: true, slug: true } },
            // so "add to cart" from the wishlist can preselect default options
            variants: { where: { status: true }, include: { items: { where: { status: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: wishlist });
  }

  static async addToWishlist(req: Request, res: Response) {
    const { productId } = req.params;
    const product = await prisma.product.findFirst({ where: { id: productId, status: true }, select: { id: true } });
    if (!product) throw AppError.notFound("Product not found");

    const item = await prisma.wishlist.upsert({
      where: { userId_productId: { userId: req.user!.id, productId } },
      update: {},
      create: { userId: req.user!.id, productId },
    });
    return res.status(201).json({ success: true, message: "Product added to wishlist", data: item });
  }

  static async removeFromWishlist(req: Request, res: Response) {
    await prisma.wishlist.deleteMany({ where: { userId: req.user!.id, productId: req.params.productId } });
    return res.json({ success: true, message: "Product removed from wishlist" });
  }

  // ---------- Reviews ----------
  static async getUserReviews(req: Request, res: Response) {
    const reviews = await prisma.productReview.findMany({
      where: { userId: req.user!.id },
      include: { product: { select: { id: true, name: true, slug: true, thumbImage: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: reviews });
  }

  /** Only buyers whose order containing the product was delivered can review it, once. */
  static async createReview(req: Request, res: Response) {
    const userId = req.user!.id;
    const { productId, rating, review } = req.body as CreateReviewInput;

    const product = await prisma.product.findFirst({ where: { id: productId, status: true }, select: { id: true } });
    if (!product) throw AppError.notFound("Product not found");

    const purchased = await prisma.orderProduct.findFirst({
      where: { productId, order: { userId, orderStatus: "DELIVERED" } },
      select: { id: true },
    });
    if (!purchased) throw AppError.forbidden("You can review a product after your order containing it has been delivered");

    const existing = await prisma.productReview.findUnique({ where: { userId_productId: { userId, productId } } });
    if (existing) throw AppError.conflict("You have already reviewed this product");

    const created = await prisma.productReview.create({
      data: { userId, productId, rating, review, status: false }, // pending admin moderation
    });
    return res.status(201).json({ success: true, message: "Review submitted for moderation", data: created });
  }
}
