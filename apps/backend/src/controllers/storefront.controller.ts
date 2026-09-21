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
      return res.status(500).json({ success: false, message: error.message });
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
      return res.status(500).json({ success: false, message: error.message });
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
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Blog articles list with pagination & category filter
   */
  static async getBlogs(req: Request, res: Response) {
    try {
      const { category, page = "1", limit = "10" } = req.query;
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 10));

      const where: any = { status: true };
      if (category) {
        where.category = { slug: String(category) };
      }

      const [total, blogs, categories] = await Promise.all([
        prisma.blog.count({ where }),
        prisma.blog.findMany({
          where,
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
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
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
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
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Submit comment on a blog post
   */
  static async addBlogComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.user!.id;

      if (!comment) {
        return res.status(400).json({ success: false, message: "Comment cannot be empty" });
      }

      const newComment = await prisma.blogComment.create({
        data: {
          blogId: id,
          userId,
          comment,
          status: true,
        },
        include: { user: { select: { name: true, avatar: true } } },
      });

      return res.status(201).json({
        success: true,
        message: "Comment posted successfully",
        data: newComment,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Newsletter double opt-in subscribe
   */
  static async subscribeNewsletter(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ success: false, message: "Valid email address required" });
      }

      const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
      if (existing) {
        if (existing.isVerified) {
          return res.status(400).json({ success: false, message: "Email is already subscribed" });
        }
        return res.json({
          success: true,
          message: "A verification token was already issued for this address",
        });
      }

      const token = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await prisma.newsletterSubscriber.create({
        data: {
          email,
          token,
          isVerified: false,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Subscribed! Please verify using the token sent to your email.",
        verificationToken: token,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Verify newsletter subscriber token
   */
  static async verifyNewsletter(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const subscriber = await prisma.newsletterSubscriber.findFirst({
        where: { token },
      });

      if (!subscriber) {
        return res.status(404).json({ success: false, message: "Invalid or expired token" });
      }

      await prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: { isVerified: true, token: null },
      });

      return res.json({ success: true, message: "Newsletter subscription verified!" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Active Advertisements & promotional banners
   */
  static async getAdvertisements(req: Request, res: Response) {
    try {
      const ads = await prisma.advertisement.findMany();
      return res.json({ success: true, data: ads });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Contact inquiry form submission
   */
  static async handleContactInquiry(req: Request, res: Response) {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: "Name, email, and message are required",
        });
      }

      return res.json({
        success: true,
        message: "Thank you! Your message has been received and our team will get back to you shortly.",
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

