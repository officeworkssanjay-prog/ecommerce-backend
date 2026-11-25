import { Response } from "express";
import bcrypt from "bcryptjs";
import { prisma, Prisma, OrderStatus, PaymentStatus, Role } from "@ecommerce/database";
import { env } from "../config/env";
import { changeOrderStatus } from "../services/order-status";
import { AppError, asyncHandler } from "../utils/errors";
import { uniqueSlug } from "../utils/slug";

const MAX_ROWS = 500;
const reply = (res: Response, message: string, data?: unknown, status = 200) =>
  res.status(status).json({ success: true, message, ...(data !== undefined && { data }) });

/** Shows only the last 4 characters of a stored secret. */
const mask = (secret?: string | null) => (secret ? `••••${secret.slice(-4)}` : "");
/** A blank value or one echoed back in masked form means "keep the stored secret". */
const keepsStoredSecret = (value?: string) => !value || value.startsWith("••");

// ---------------------------------------------------------------------------
// Generic CRUD for the simple admin resources
// ---------------------------------------------------------------------------
interface CrudOptions {
  /** Used in messages: "Category" -> "Category created". */
  label: string;
  model: () => any;
  /** Findmany args for the list endpoint. */
  list: Record<string, unknown>;
  /** Field to derive a unique slug from on create (name / title). */
  slugFrom?: "name" | "title";
  /** Foreign keys that must point at an existing record when provided. */
  parents?: { field: string; model: () => any; label: string }[];
  /** Cross-field rules / transformations. `existing` is set on update. */
  prepare?: (data: any, existing?: any) => any | Promise<any>;
}

function crud(opts: CrudOptions) {
  const checkParents = async (data: Record<string, unknown>) => {
    for (const p of opts.parents ?? []) {
      const id = data[p.field];
      if (id === undefined || id === null) continue;
      const found = await p.model().findUnique({ where: { id }, select: { id: true } });
      if (!found) throw AppError.badRequest(`${p.label} not found`, { [p.field]: [`${p.label} not found`] });
    }
  };

  return {
    list: asyncHandler(async (_req, res) => {
      const rows = await opts.model().findMany({ take: MAX_ROWS, ...opts.list });
      return res.json({ success: true, data: rows });
    }),

    create: asyncHandler(async (req, res) => {
      let data = { ...req.body };
      await checkParents(data);
      if (opts.slugFrom) {
        data.slug = await uniqueSlug(data[opts.slugFrom], async (s) => Boolean(await opts.model().findUnique({ where: { slug: s }, select: { id: true } })));
      }
      if (opts.prepare) data = await opts.prepare(data);
      const created = await opts.model().create({ data });
      return reply(res, `${opts.label} created`, created, 201);
    }),

    update: asyncHandler(async (req, res) => {
      const { id } = req.params;
      const existing = await opts.model().findUnique({ where: { id } });
      if (!existing) throw AppError.notFound(`${opts.label} not found`);
      let data = { ...req.body }; // slugs stay stable on rename so existing links keep working
      await checkParents(data);
      if (opts.prepare) data = await opts.prepare(data, existing);
      const updated = await opts.model().update({ where: { id }, data });
      return reply(res, `${opts.label} updated`, updated);
    }),

    remove: asyncHandler(async (req, res) => {
      try {
        await opts.model().delete({ where: { id: req.params.id } });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
          throw AppError.conflict(`${opts.label} is in use and cannot be deleted. Disable it instead.`);
        }
        throw err;
      }
      return reply(res, `${opts.label} deleted`);
    }),
  };
}

const fieldError = (field: string, message: string) => AppError.badRequest(message, { [field]: [message] });

const sliders = crud({ label: "Slider", model: () => prisma.slider, list: { orderBy: { serial: "asc" } } });

const categories = crud({
  label: "Category",
  model: () => prisma.category,
  slugFrom: "name",
  list: { include: { _count: { select: { subCategories: true, products: true } } }, orderBy: { name: "asc" } },
});

const subCategories = crud({
  label: "SubCategory",
  model: () => prisma.subCategory,
  slugFrom: "name",
  parents: [{ field: "categoryId", model: () => prisma.category, label: "Category" }],
  list: {
    include: { category: { select: { name: true } }, _count: { select: { childCategories: true, products: true } } },
    orderBy: { name: "asc" },
  },
});

const childCategories = crud({
  label: "ChildCategory",
  model: () => prisma.childCategory,
  slugFrom: "name",
  parents: [{ field: "subCategoryId", model: () => prisma.subCategory, label: "Sub-category" }],
  list: {
    include: { subCategory: { select: { name: true, category: { select: { name: true } } } }, _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  },
});

const brands = crud({
  label: "Brand",
  model: () => prisma.brand,
  slugFrom: "name",
  list: { include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } },
});

const coupons = crud({
  label: "Coupon",
  model: () => prisma.coupon,
  list: { orderBy: { createdAt: "desc" } },
  prepare: (data, existing) => {
    const merged = { ...existing, ...data };
    if (new Date(merged.endDate) < new Date(merged.startDate)) throw fieldError("endDate", "End date must be after the start date");
    if (merged.discountType === "PERCENT" && Number(merged.discount) > 100) throw fieldError("discount", "A percentage discount cannot exceed 100");
    if (existing && data.quantity !== undefined && data.quantity < existing.totalUsed) {
      throw fieldError("quantity", `Quantity cannot be lower than the ${existing.totalUsed} already redeemed`);
    }
    return data;
  },
});

const pincodes = crud({ label: "Pincode", model: () => prisma.serviceablePincode, list: { orderBy: { pincode: "asc" } } });
const shippingRules = crud({ label: "Shipping rule", model: () => prisma.shippingRule, list: { orderBy: { createdAt: "desc" } } });

const blogCategories = crud({
  label: "Blog category",
  model: () => prisma.blogCategory,
  slugFrom: "name",
  list: { include: { _count: { select: { blogs: true } } }, orderBy: { name: "asc" } },
});

const blogs = crud({
  label: "Blog post",
  model: () => prisma.blog,
  slugFrom: "title",
  parents: [{ field: "categoryId", model: () => prisma.blogCategory, label: "Blog category" }],
  list: { include: { category: { select: { name: true } }, _count: { select: { comments: true } } }, orderBy: { createdAt: "desc" } },
});

/** Catalogue consistency: category > sub-category > child category must form one chain, offers must be sane. */
async function prepareProduct(data: any, existing?: any) {
  const m = { ...existing, ...data };

  for (const [field, model, label] of [
    ["categoryId", prisma.category, "Category"],
    ["subCategoryId", prisma.subCategory, "Sub-category"],
    ["childCategoryId", prisma.childCategory, "Child category"],
    ["brandId", prisma.brand, "Brand"],
  ] as const) {
    if (data[field] && !(await (model as any).findUnique({ where: { id: data[field] }, select: { id: true } }))) {
      throw fieldError(field, `${label} not found`);
    }
  }
  if (m.subCategoryId) {
    const sub = await prisma.subCategory.findUnique({ where: { id: m.subCategoryId }, select: { categoryId: true } });
    if (sub && sub.categoryId !== m.categoryId) throw fieldError("subCategoryId", "This sub-category does not belong to the selected category");
  }
  if (m.childCategoryId) {
    if (!m.subCategoryId) throw fieldError("childCategoryId", "Select a sub-category before a child category");
    const child = await prisma.childCategory.findUnique({ where: { id: m.childCategoryId }, select: { subCategoryId: true } });
    if (child && child.subCategoryId !== m.subCategoryId) throw fieldError("childCategoryId", "This child category does not belong to the selected sub-category");
  }

  const price = Number(m.price);
  if (m.offerPrice !== null && m.offerPrice !== undefined && Number(m.offerPrice) > price) {
    throw fieldError("offerPrice", "Offer price cannot be higher than the regular price");
  }
  if (m.offerStartDate && m.offerEndDate && new Date(m.offerEndDate) < new Date(m.offerStartDate)) {
    throw fieldError("offerEndDate", "Offer end date must be after the start date");
  }
  return data;
}

const products = crud({
  label: "Product",
  model: () => prisma.product,
  slugFrom: "name",
  list: { include: { category: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
  prepare: prepareProduct,
});

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------
export class AdminController {
  static getDashboard = asyncHandler(async (_req, res) => {
    const [totalUsers, totalProducts, totalOrders, pendingOrders, revenue] = await Promise.all([
      prisma.user.count({ where: { role: Role.USER } }),
      prisma.product.count({ where: { status: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: OrderStatus.PENDING } }),
      prisma.order.aggregate({ _sum: { amount: true }, where: { paymentStatus: PaymentStatus.PAID } }),
    ]);
    return res.json({
      success: true,
      data: { totalUsers, totalProducts, totalOrders, pendingOrders, totalRevenue: revenue._sum.amount || 0 },
    });
  });

  // ----- Orders -----
  static getOrders = asyncHandler(async (req, res) => {
    const { status } = req.query as { status?: OrderStatus };
    const orders = await prisma.order.findMany({
      where: status ? { orderStatus: status } : {},
      include: { user: { select: { name: true, email: true } }, orderProducts: true, transaction: true },
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS,
    });
    return res.json({ success: true, data: orders });
  });

  static updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await changeOrderStatus(req.params.id, req.body);
    return reply(res, "Order status updated successfully", order);
  });

  // ----- Users -----
  static getUsers = asyncHandler(async (req, res) => {
    const { role, status } = req.query as { role?: Role; status?: "true" | "false" };
    const users = await prisma.user.findMany({
      where: { ...(role && { role }), ...(status && { status: status === "true" }) },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS,
    });
    return res.json({ success: true, data: users });
  });

  static updateUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body as { status: boolean };

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) throw AppError.notFound("User not found");

    if (!status) {
      if (target.id === req.user!.id) throw AppError.badRequest("You cannot deactivate your own account");
      if (target.role === "ADMIN" && target.status) {
        const otherAdmins = await prisma.user.count({ where: { role: "ADMIN", status: true, id: { not: id } } });
        if (otherAdmins === 0) throw AppError.conflict("At least one active admin account is required");
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    return reply(res, "User status updated", user);
  });

  static createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, phone } = req.body as { name: string; email: string; password: string; role: Role; phone?: string };
    if (await prisma.user.findUnique({ where: { email } })) throw AppError.conflict("Email already exists");

    const user = await prisma.user.create({
      data: { name, email, phone, role, status: true, password: await bcrypt.hash(password, 10) },
      select: { id: true, name: true, email: true, role: true },
    });
    return reply(res, "User created", user, 201);
  });

  // ----- Simple resources -----
  static getSliders = sliders.list;
  static createSlider = sliders.create;
  static updateSlider = sliders.update;
  static deleteSlider = sliders.remove;

  static getCategories = categories.list;
  static createCategory = categories.create;
  static updateCategory = categories.update;
  static deleteCategory = categories.remove;

  static getSubCategories = subCategories.list;
  static createSubCategory = subCategories.create;
  static updateSubCategory = subCategories.update;
  static deleteSubCategory = subCategories.remove;

  static getChildCategories = childCategories.list;
  static createChildCategory = childCategories.create;
  static updateChildCategory = childCategories.update;
  static deleteChildCategory = childCategories.remove;

  static getBrands = brands.list;
  static createBrand = brands.create;
  static updateBrand = brands.update;
  static deleteBrand = brands.remove;

  static getProducts = products.list;
  static createProduct = products.create;
  static updateProduct = products.update;
  static deleteProduct = products.remove;

  static getCoupons = coupons.list;
  static createCoupon = coupons.create;
  static updateCoupon = coupons.update;
  static deleteCoupon = coupons.remove;

  static getPincodes = pincodes.list;
  static createPincode = pincodes.create;
  static updatePincode = pincodes.update;
  static deletePincode = pincodes.remove;

  static getStockAlerts = asyncHandler(async (_req, res) => {
    const rows = await prisma.stockAlert.findMany({
      take: MAX_ROWS,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true, slug: true, qty: true } } },
    });
    return res.json({ success: true, data: rows });
  });

  static getShippingRules = shippingRules.list;
  static createShippingRule = shippingRules.create;
  static updateShippingRule = shippingRules.update;
  static deleteShippingRule = shippingRules.remove;

  static getBlogCategories = blogCategories.list;
  static createBlogCategory = blogCategories.create;
  static updateBlogCategory = blogCategories.update;
  static deleteBlogCategory = blogCategories.remove;

  static getBlogs = blogs.list;
  static createBlog = blogs.create;
  static updateBlog = blogs.update;
  static deleteBlog = blogs.remove;

  // ----- Reviews -----
  static getReviews = asyncHandler(async (_req, res) => {
    const reviews = await prisma.productReview.findMany({
      include: { product: { select: { name: true, slug: true } }, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS,
    });
    return res.json({ success: true, data: reviews });
  });

  static updateReviewStatus = asyncHandler(async (req, res) => {
    const review = await prisma.productReview.update({ where: { id: req.params.id }, data: { status: req.body.status } });
    return reply(res, "Review status updated", review);
  });

  // ----- Flash sale -----
  static getFlashSale = asyncHandler(async (_req, res) => {
    const flashSale = await prisma.flashSale.findFirst({
      include: { products: { include: { product: { select: { id: true, name: true, price: true, thumbImage: true } } } } },
    });
    return res.json({ success: true, data: flashSale });
  });

  static updateFlashSale = asyncHandler(async (req, res) => {
    const { endDate, showAtHome } = req.body as { endDate?: Date; showAtHome?: boolean };
    const existing = await prisma.flashSale.findFirst();

    if (!existing && !endDate) throw fieldError("endDate", "End date is required");
    if (endDate && endDate.getTime() <= Date.now()) throw fieldError("endDate", "End date must be in the future");

    const flashSale = existing
      ? await prisma.flashSale.update({ where: { id: existing.id }, data: { endDate, showAtHome } })
      : await prisma.flashSale.create({ data: { endDate: endDate!, showAtHome: showAtHome ?? false } });
    return reply(res, "Flash sale updated", flashSale);
  });

  static addFlashSaleProduct = asyncHandler(async (req, res) => {
    const { flashSaleId, productId, showAtHome } = req.body as { flashSaleId: string; productId: string; showAtHome: boolean };
    if (!(await prisma.flashSale.findUnique({ where: { id: flashSaleId }, select: { id: true } }))) throw fieldError("flashSaleId", "Flash sale not found");
    if (!(await prisma.product.findUnique({ where: { id: productId }, select: { id: true } }))) throw fieldError("productId", "Product not found");

    try {
      const item = await prisma.flashSaleProduct.create({ data: { flashSaleId, productId, showAtHome, status: true } });
      return reply(res, "Product added to flash sale", item, 201);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") throw AppError.conflict("This product is already in the flash sale");
      throw err;
    }
  });

  static removeFlashSaleProduct = asyncHandler(async (req, res) => {
    await prisma.flashSaleProduct.delete({ where: { id: req.params.id } });
    return reply(res, "Product removed from flash sale");
  });

  // ----- Advertisements -----
  static getAdvertisements = asyncHandler(async (_req, res) => {
    return res.json({ success: true, data: await prisma.advertisement.findMany() });
  });

  static updateAdvertisement = asyncHandler(async (req, res) => {
    const { key, value } = req.body as { key: string; value: Prisma.InputJsonObject };
    const ad = await prisma.advertisement.upsert({ where: { key }, update: { value }, create: { key, value } });
    return reply(res, "Advertisement banner updated", ad);
  });

  // ----- Blog comments -----
  static getBlogComments = asyncHandler(async (_req, res) => {
    const comments = await prisma.blogComment.findMany({
      include: { blog: { select: { title: true, slug: true } }, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS,
    });
    return res.json({ success: true, data: comments });
  });

  static updateBlogCommentStatus = asyncHandler(async (req, res) => {
    const comment = await prisma.blogComment.update({ where: { id: req.params.id }, data: { status: req.body.status } });
    return reply(res, "Comment status updated", comment);
  });

  static deleteBlogComment = asyncHandler(async (req, res) => {
    await prisma.blogComment.delete({ where: { id: req.params.id } });
    return reply(res, "Comment deleted");
  });

  // ----- Contact inbox -----
  static getContactMessages = asyncHandler(async (_req, res) => {
    const [messages, unread] = await Promise.all([
      prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: MAX_ROWS }),
      prisma.contactMessage.count({ where: { isRead: false } }),
    ]);
    return res.json({ success: true, data: messages, unread });
  });

  static updateContactMessage = asyncHandler(async (req, res) => {
    const message = await prisma.contactMessage.update({ where: { id: req.params.id }, data: { isRead: req.body.isRead } });
    return reply(res, "Message updated", message);
  });

  static deleteContactMessage = asyncHandler(async (req, res) => {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    return reply(res, "Message deleted");
  });

  // ----- Newsletter -----
  static getSubscribers = asyncHandler(async (_req, res) => {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      // The verification token is a secret link; never show it in the admin list
      select: { id: true, email: true, isVerified: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS,
    });
    return res.json({ success: true, data: subscribers });
  });

  static sendSubscribersMail = asyncHandler(async (_req, res) => {
    // No mail transport exists yet. Say so instead of pretending the message was queued.
    const recipients = await prisma.newsletterSubscriber.count({ where: { isVerified: true } });
    return res.status(501).json({
      success: false,
      message: `Email sending is not configured yet, so nothing was sent (${recipients} verified subscriber(s) would receive it).`,
    });
  });

  // ----- Settings (secrets are never returned) -----
  static getSettings = asyncHandler(async (_req, res) => {
    const [general, email, pusher, razorpay, cod] = await Promise.all([
      prisma.generalSetting.findFirst(),
      prisma.emailSetting.findFirst(),
      prisma.pusherSetting.findFirst(),
      prisma.razorpaySetting.findFirst(),
      prisma.codSetting.findFirst(),
    ]);

    return res.json({
      success: true,
      data: {
        general,
        email: email && { ...email, password: mask(email.password), hasPassword: Boolean(email.password) },
        pusher: pusher && { ...pusher, secret: mask(pusher.secret), hasSecret: Boolean(pusher.secret) },
        paymentGateways: {
          razorpay: razorpay && {
            id: razorpay.id,
            status: razorpay.status,
            countryName: razorpay.countryName,
            currencyName: razorpay.currencyName,
            currencyRate: razorpay.currencyRate,
          },
          // Razorpay API keys live in the server environment, not in the database.
          razorpayKeysConfigured: env.razorpayEnabled,
          cod,
        },
      },
    });
  });

  static updateGeneralSetting = asyncHandler(async (req, res) => {
    const existing = await prisma.generalSetting.findFirst();
    const updated = existing
      ? await prisma.generalSetting.update({ where: { id: existing.id }, data: req.body })
      : await prisma.generalSetting.create({ data: req.body });
    return reply(res, "General settings updated", updated);
  });

  static updateEmailSetting = asyncHandler(async (req, res) => {
    const { password, ...rest } = req.body as { password?: string } & Record<string, unknown>;
    const existing = await prisma.emailSetting.findFirst();
    if (!existing && keepsStoredSecret(password)) throw fieldError("password", "Password is required");

    const data = { ...rest, ...(keepsStoredSecret(password) ? {} : { password }) } as Prisma.EmailSettingUncheckedCreateInput;
    const saved = existing
      ? await prisma.emailSetting.update({ where: { id: existing.id }, data })
      : await prisma.emailSetting.create({ data });
    return reply(res, "Email settings updated", { ...saved, password: mask(saved.password), hasPassword: true });
  });

  static updatePusherSetting = asyncHandler(async (req, res) => {
    const { secret, ...rest } = req.body as { secret?: string } & Record<string, unknown>;
    const existing = await prisma.pusherSetting.findFirst();
    if (!existing && keepsStoredSecret(secret)) throw fieldError("secret", "Secret is required");

    const data = { ...rest, ...(keepsStoredSecret(secret) ? {} : { secret }) } as Prisma.PusherSettingUncheckedCreateInput;
    const saved = existing
      ? await prisma.pusherSetting.update({ where: { id: existing.id }, data })
      : await prisma.pusherSetting.create({ data });
    return reply(res, "Pusher settings updated", { ...saved, secret: mask(saved.secret), hasSecret: true });
  });

  static updatePaymentGatewaySettings = asyncHandler(async (req, res) => {
    const body = req.body as
      | { gateway: "RAZORPAY"; settings: Prisma.RazorpaySettingUpdateInput }
      | { gateway: "COD"; settings: { status: boolean } };

    if (body.gateway === "COD") {
      const existing = await prisma.codSetting.findFirst();
      const updated = existing
        ? await prisma.codSetting.update({ where: { id: existing.id }, data: body.settings })
        : await prisma.codSetting.create({ data: body.settings });
      return reply(res, "COD settings updated", updated);
    }

    const existing = await prisma.razorpaySetting.findFirst();
    const saved = existing
      ? await prisma.razorpaySetting.update({ where: { id: existing.id }, data: body.settings })
      : await prisma.razorpaySetting.create({
          // Key columns are mandatory in the schema but unused: real keys come from the environment.
          data: { ...(body.settings as Prisma.RazorpaySettingUncheckedCreateInput), razorpayKey: "managed-by-environment", razorpaySecretKey: "managed-by-environment" },
        });
    return reply(res, "RAZORPAY settings updated", {
      id: saved.id,
      status: saved.status,
      countryName: saved.countryName,
      currencyName: saved.currencyName,
      currencyRate: saved.currencyRate,
    });
  });
}
