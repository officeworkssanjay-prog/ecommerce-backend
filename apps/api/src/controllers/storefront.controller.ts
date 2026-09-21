import { Request, Response } from "express";
import { prisma, Prisma } from "@ecommerce/database";
import { ProductFilterSchema } from "@ecommerce/shared-types";

export class StorefrontController {
  /**
   * Homepage curated data payload
   */
  static async getHomeData(req: Request, res: Response) {
    try {
      const [sliders, categories, flashSale, brands, newArrivals, featuredProducts] =
        await Promise.all([
          prisma.slider.findMany({
            where: { status: true },
            orderBy: { serial: "asc" },
          }),
          prisma.category.findMany({
            where: { status: true },
            include: {
              subCategories: {
                where: { status: true },
                include: { childCategories: { where: { status: true } } },
              },
            },
          }),
          prisma.flashSale.findFirst({
            where: {
              endDate: { gt: new Date() },
              showAtHome: true,
            },
            include: {
              products: {
                where: { status: true, showAtHome: true },
                include: {
                  product: {
                    include: {
                      variants: { include: { items: true } },
                    },
                  },
                },
              },
            },
          }),
          prisma.brand.findMany({
            where: { status: true, isFeatured: true },
            take: 12,
          }),
          prisma.product.findMany({
            where: { status: true, isApproved: true, productType: "NEW_ARRIVAL" },
            include: { variants: { include: { items: true } } },
            take: 8,
            orderBy: { createdAt: "desc" },
          }),
          prisma.product.findMany({
            where: { status: true, isApproved: true, productType: "FEATURED_PRODUCT" },
            include: { variants: { include: { items: true } } },
            take: 8,
          }),
        ]);

      return res.json({
        success: true,
        data: {
          sliders,
          categories,
          flashSale,
          brands,
          newArrivals,
          featuredProducts,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Search & Filter product catalog with server-side pagination
   */
  static async getProducts(req: Request, res: Response) {
    try {
      const query = ProductFilterSchema.parse(req.query);
      const { page, limit, sort, search, category, brand, minPrice, maxPrice } = query;

      const where: Prisma.ProductWhereInput = {
        status: true,
        isApproved: true,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { shortDescription: { contains: search, mode: "insensitive" } },
        ];
      }

      if (category) {
        where.category = { slug: category };
      }

      if (brand) {
        where.brand = { slug: brand };
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
      }

      let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
      if (sort === "price_low") orderBy = { price: "asc" };
      if (sort === "price_high") orderBy = { price: "desc" };

      const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy,
          include: {
            category: { select: { name: true, slug: true } },
            brand: { select: { name: true, slug: true } },
            variants: { include: { items: true } },
          },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          products,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Single product details by slug with variants, gallery, reviews
   */
  static async getProductBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          subCategory: true,
          childCategory: true,
          brand: true,
          vendor: { select: { id: true, shopName: true, banner: true, phone: true } },
          variants: {
            where: { status: true },
            include: {
              items: { where: { status: true } },
            },
          },
          imageGallery: true,
          reviews: {
            where: { status: true },
            include: { user: { select: { name: true, avatar: true } } },
          },
        },
      });

      if (!product || !product.status || !product.isApproved) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      return res.json({ success: true, data: product });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Public approved vendors directory
   */
  static async getVendors(req: Request, res: Response) {
    try {
      const vendors = await prisma.vendor.findMany({
        where: { status: true },
        include: {
          _count: { select: { products: { where: { status: true, isApproved: true } } } },
        },
      });
      return res.json({ success: true, data: vendors });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
