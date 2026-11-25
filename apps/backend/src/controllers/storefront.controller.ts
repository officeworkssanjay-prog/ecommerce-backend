import { Request, Response } from "express";
import { prisma, Prisma } from "@ecommerce/database";
import crypto from "crypto";
import { ProductFilterInput } from "@ecommerce/shared-types";
import { env } from "../config/env";
import { AppError } from "../utils/errors";
import { checkPincode } from "../services/pincode.service";

export class StorefrontController {
  /**
   * Homepage curated data payload
   */
  static async getHomeData(req: Request, res: Response) {
    try {
      const [sliders, categories, flashSale, brands, newArrivals, featuredProducts, bestSellers] =
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
            where: { status: true, productType: "NEW_ARRIVAL" },
            include: { variants: { include: { items: true } } },
            take: 8,
            orderBy: { createdAt: "desc" },
          }),
          prisma.product.findMany({
            where: { status: true, productType: "FEATURED_PRODUCT" },
            include: { variants: { include: { items: true } } },
            take: 8,
          }),
          prisma.product.findMany({
            where: { status: true, productType: "BEST_PRODUCT" },
            include: { variants: { include: { items: true } }, category: { select: { name: true, slug: true } } },
            take: 4,
            orderBy: { createdAt: "desc" },
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
          bestSellers,
        },
      });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Search & Filter product catalog with server-side pagination
   */
  static async getProducts(req: Request, res: Response) {
    try {
      const query = req.query as unknown as ProductFilterInput; // validated by the route
      const { page, limit, sort, search, category, subCategory, childCategory, brand, minPrice, maxPrice, sale, size } = query;

      const where: Prisma.ProductWhereInput = {
        status: true,
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
      if (subCategory) where.subCategory = { slug: subCategory };
      if (childCategory) where.childCategory = { slug: childCategory };

      if (brand) {
        where.brand = { slug: brand };
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
      }

      // "Sale": a valid offer price right now
      if (sale) {
        const now = new Date();
        where.offerPrice = { not: null };
        where.AND = [
          { OR: [{ offerStartDate: null }, { offerStartDate: { lte: now } }] },
          { OR: [{ offerEndDate: null }, { offerEndDate: { gte: now } }] },
        ];
      }

      // e.g. bangle size "2.4": products offering that option in any variant group
      if (size) {
        where.variants = { some: { status: true, items: { some: { status: true, name: size } } } };
      }

      let orderBy: Prisma.ProductOrderByWithRelationInput[] = [{ createdAt: "desc" }];
      if (sort === "price_low") orderBy = [{ price: "asc" }];
      if (sort === "price_high") orderBy = [{ price: "desc" }];
      // "recommended" / "popular" = most ordered first, newest as the tie-breaker
      if (sort === "recommended" || sort === "popular") orderBy = [{ orderProducts: { _count: "desc" } }, { createdAt: "desc" }];

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
      throw error;
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

      if (!product || !product.status) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      return res.json({ success: true, data: product });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Active Flash Sale event and all featured sale products
   */
  static async getFlashSale(req: Request, res: Response) {
    try {
      const flashSale = await prisma.flashSale.findFirst({
        where: { endDate: { gt: new Date() } },
        include: {
          products: {
            where: { status: true },
            include: {
              product: {
                include: {
                  category: { select: { name: true, slug: true } },
                  brand: { select: { name: true, slug: true } },
                  variants: { include: { items: true } },
                },
              },
            },
          },
        },
      });

      return res.json({ success: true, data: flashSale });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Complete Category Hierarchy
   */
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        where: { status: true },
        include: {
          subCategories: {
            where: { status: true },
            include: {
              childCategories: { where: { status: true } },
            },
          },
        },
      });
      return res.json({ success: true, data: categories });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Active & Featured Brands
   */
  static async getBrands(req: Request, res: Response) {
    try {
      const brands = await prisma.brand.findMany({
        where: { status: true },
        orderBy: { name: "asc" },
      });
      return res.json({ success: true, data: brands });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Blog articles list with pagination & category filter
   */
  static async getBlogs(req: Request, res: Response) {
    const { category, page, limit } = req.query as unknown as { category?: string; page: number; limit: number };

    const where: Prisma.BlogWhereInput = { status: true };
    if (category) where.category = { slug: category };

    const [total, blogs, categories] = await Promise.all([
      prisma.blog.count({ where }),
      prisma.blog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { comments: { where: { status: true } } } },
        },
      }),
      prisma.blogCategory.findMany({
        where: { status: true },
        include: { _count: { select: { blogs: { where: { status: true } } } } },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        blogs,
        categories,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  }

  /**
   * Single Blog post details by slug with approved comments
   */
  static async getBlogBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const blog = await prisma.blog.findUnique({
        where: { slug },
        include: {
          category: true,
          comments: {
            where: { status: true },
            include: { user: { select: { name: true, avatar: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!blog || !blog.status) {
        return res.status(404).json({ success: false, message: "Blog article not found" });
      }

      return res.json({ success: true, data: blog });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Submit comment on a blog post
   */
  static async addBlogComment(req: Request, res: Response) {
    const { id } = req.params;
    const { comment } = req.body as { comment: string };

    const blog = await prisma.blog.findFirst({ where: { id, status: true }, select: { id: true } });
    if (!blog) throw AppError.notFound("Blog article not found");

    const newComment = await prisma.blogComment.create({
      data: { blogId: id, userId: req.user!.id, comment, status: true },
      include: { user: { select: { name: true, avatar: true } } },
    });

    return res.status(201).json({ success: true, message: "Comment posted successfully", data: newComment });
  }

  /**
   * Newsletter double opt-in subscribe
   */
  static async subscribeNewsletter(req: Request, res: Response) {
    const { email } = req.body as { email: string };

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing?.isVerified) throw AppError.conflict("Email is already subscribed");
    if (existing) {
      return res.json({ success: true, message: "A verification link was already sent to this address" });
    }

    const token = crypto.randomBytes(24).toString("hex");
    await prisma.newsletterSubscriber.create({ data: { email, token, isVerified: false } });

    // No mail transport is wired up yet, so the token is only exposed outside production (for testing).
    return res.status(201).json({
      success: true,
      message: "Subscribed! Please verify using the link sent to your email.",
      ...(env.isProduction ? {} : { verificationToken: token }),
    });
  }

  /**
   * Verify newsletter subscriber token
   */
  static async verifyNewsletter(req: Request, res: Response) {
    const { token } = req.params;
    const subscriber = await prisma.newsletterSubscriber.findFirst({ where: { token } });
    if (!subscriber) throw AppError.notFound("Invalid or expired token");

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { isVerified: true, token: null },
    });

    return res.json({ success: true, message: "Newsletter subscription verified!" });
  }

  /**
   * Active Advertisements & promotional banners
   */
  static async getAdvertisements(req: Request, res: Response) {
    try {
      const ads = await prisma.advertisement.findMany();
      return res.json({ success: true, data: ads });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Contact inquiry form submission
   */
  static async handleContactInquiry(req: Request, res: Response) {
    const { name, email, subject, message } = req.body as { name: string; email: string; subject?: string; message: string };
    // Stored for the admin inbox (Admin → Messages). Input is validated by the route.
    await prisma.contactMessage.create({ data: { name, email, subject: subject || null, message } });
    return res.json({
      success: true,
      message: "Thank you! Your message has been received and our team will get back to you shortly.",
    });
  }

  /** Delivery check for a pincode. `configured: false` means the store does not restrict delivery areas. */
  static async checkPincode(req: Request, res: Response) {
    const result = await checkPincode(prisma, req.params.pincode);
    return res.json({ success: true, data: result });
  }

  /** "Notify me" request for a sold-out product. Idempotent per product + email. */
  static async createStockAlert(req: Request, res: Response) {
    const { slug } = req.params;
    const { email } = req.body as { email: string };
    const product = await prisma.product.findFirst({ where: { slug, status: true }, select: { id: true, qty: true } });
    if (!product) throw AppError.notFound("Product not found");
    if (product.qty > 0) throw AppError.badRequest("This product is in stock");
    await prisma.stockAlert.upsert({
      where: { productId_email: { productId: product.id, email } },
      create: { productId: product.id, email },
      update: {},
    });
    return res.status(201).json({ success: true, message: "We have saved your request. We will let you know when it is back." });
  }

  /**
   * Active Shipping Rules for Checkout calculation
   */
  static async getShippingRules(req: Request, res: Response) {
    try {
      const rules = await prisma.shippingRule.findMany({
        where: { status: true },
        orderBy: { cost: "asc" },
      });
      return res.json({ success: true, data: rules });
    } catch (error: any) {
      throw error;
    }
  }
}


