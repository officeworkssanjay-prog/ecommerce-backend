import { z } from "zod";
import { ImageUrlSchema, PhoneSchema, RoleEnum } from "./auth";
import { emptyToUndefined } from "./common";
import { OrderStatusEnum, PaymentStatusEnum } from "./order";
import { ProductTypeEnum } from "./product";

// ---------- building blocks ----------
const name = (label = "Name", max = 120) =>
  z.string({ required_error: `${label} is required` }).trim().min(2, `${label} must be at least 2 characters`).max(max, `${label} must be at most ${max} characters`);
const optionalText = (max: number) => z.string().trim().max(max, `Must be at most ${max} characters`).nullish();
const requiredImage = z.string({ required_error: "Image is required" }).trim().min(1, "Image is required").pipe(ImageUrlSchema);
const optionalImage = ImageUrlSchema.nullish();
const money = (label: string) => z.coerce.number({ invalid_type_error: `${label} must be a number` }).min(0, `${label} cannot be negative`).max(10_000_000, `${label} is too large`);
const uuid = (label: string) => z.string({ required_error: `${label} is required` }).uuid(`Select a valid ${label.toLowerCase()}`);
const nullableUuid = (label: string) => z.preprocess((v) => (v === "" ? null : v), z.string().uuid(`Select a valid ${label.toLowerCase()}`).nullish());
const bool = z.boolean({ invalid_type_error: "Must be true or false" });
const nullableDate = z.preprocess((v) => (v === "" ? null : v), z.coerce.date({ invalid_type_error: "Invalid date" }).nullish());
const link = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^\/(?!\/)\S*$/.test(v) || /^https?:\/\/\S+$/i.test(v), "Enter a site path (e.g. /products) or a full URL");

/** `schema.partial()` for update endpoints, requiring at least one field. */
export const atLeastOne = <T extends z.ZodRawShape>(shape: z.ZodObject<T>) =>
  shape.partial().refine((o) => Object.values(o).some((v) => v !== undefined), { message: "Provide at least one field to update" });

// ---------- orders & users ----------
export const AdminOrdersQuerySchema = z.object({
  status: z.preprocess(emptyToUndefined, OrderStatusEnum.optional()),
});

export const UpdateOrderStatusSchema = z
  .object({ orderStatus: OrderStatusEnum.optional(), paymentStatus: PaymentStatusEnum.optional() })
  .refine((o) => o.orderStatus !== undefined || o.paymentStatus !== undefined, { message: "Provide an order status or a payment status" });

export const AdminUsersQuerySchema = z.object({
  role: z.preprocess(emptyToUndefined, RoleEnum.optional()),
  status: z.preprocess(emptyToUndefined, z.enum(["true", "false"]).optional()),
});

export const UpdateUserStatusSchema = z.object({ status: bool });

export const CreateUserSchema = z.object({
  name: name("Name", 80),
  email: z.string({ required_error: "Email is required" }).trim().toLowerCase().email("Invalid email address").max(254),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: RoleEnum.default("USER"),
  phone: PhoneSchema.optional(),
});

// ---------- catalogue ----------
const sliderShape = z.object({
  banner: requiredImage,
  type: optionalText(80),
  title: optionalText(150),
  subtitle: optionalText(200),
  startingPrice: z.preprocess((v) => (v === "" ? null : v), money("Starting price").nullish()),
  btnUrl: link.nullish(),
  serial: z.coerce.number().int().min(0).max(1000).default(1),
  status: bool.default(true),
});
export const CreateSliderSchema = sliderShape;
export const UpdateSliderSchema = atLeastOne(sliderShape);

const categoryShape = z.object({ name: name("Category name", 80), icon: optionalText(40), status: bool.default(true) });
export const CreateCategorySchema = categoryShape;
export const UpdateCategorySchema = atLeastOne(categoryShape);

const subCategoryShape = z.object({ categoryId: uuid("Category"), name: name("Sub-category name", 80), status: bool.default(true) });
export const CreateSubCategorySchema = subCategoryShape;
export const UpdateSubCategorySchema = atLeastOne(subCategoryShape);

const childCategoryShape = z.object({ subCategoryId: uuid("Sub-category"), name: name("Child category name", 80), status: bool.default(true) });
export const CreateChildCategorySchema = childCategoryShape;
export const UpdateChildCategorySchema = atLeastOne(childCategoryShape);

const brandShape = z.object({ name: name("Brand name", 80), logo: optionalImage, isFeatured: bool.default(false), status: bool.default(true) });
export const CreateBrandSchema = brandShape;
export const UpdateBrandSchema = atLeastOne(brandShape);

const productShape = z.object({
  name: name("Product name", 150),
  categoryId: uuid("Category"),
  subCategoryId: nullableUuid("Sub-category"),
  childCategoryId: nullableUuid("Child category"),
  brandId: nullableUuid("Brand"),
  thumbImage: requiredImage,
  qty: z.coerce.number({ invalid_type_error: "Stock must be a number" }).int("Stock must be a whole number").min(0, "Stock cannot be negative").max(1_000_000),
  price: money("Price").refine((v) => v > 0, "Price must be greater than 0"),
  offerPrice: z.preprocess((v) => (v === "" ? null : v), money("Offer price").nullish()),
  offerStartDate: nullableDate,
  offerEndDate: nullableDate,
  shortDescription: optionalText(500),
  longDescription: optionalText(10000),
  videoLink: z.preprocess((v) => (v === "" ? null : v), z.string().trim().url("Enter a valid video URL").max(500).nullish()),
  sku: z.preprocess((v) => (v === "" ? null : v), z.string().trim().min(2).max(40).nullish()),
  productType: z.preprocess((v) => (v === "" ? null : v), ProductTypeEnum.nullish()),
  seoTitle: optionalText(70),
  seoDescription: optionalText(300),
  status: bool.default(true),
});
export const CreateProductAdminSchema = productShape;
export const UpdateProductAdminSchema = atLeastOne(productShape);

export const ReviewStatusSchema = z.object({ status: bool });

// ---------- marketing ----------
export const UpdateFlashSaleSchema = z.object({
  endDate: z.coerce.date({ required_error: "End date is required", invalid_type_error: "Invalid end date" }).optional(),
  showAtHome: bool.optional(),
});
export const AddFlashSaleProductSchema = z.object({
  flashSaleId: uuid("Flash sale"),
  productId: uuid("Product"),
  showAtHome: bool.default(false),
});

const couponShape = z.object({
  name: name("Coupon name", 80),
  code: z
    .string({ required_error: "Coupon code is required" })
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{3,30}$/, "Code must be 3-30 letters, numbers, - or _"),
  quantity: z.coerce.number().int("Must be a whole number").min(1, "Quantity must be at least 1").max(1_000_000),
  maxUse: z.coerce.number().int("Must be a whole number").min(1, "Max use must be at least 1").max(1_000_000).default(1),
  startDate: z.coerce.date({ required_error: "Start date is required", invalid_type_error: "Invalid start date" }),
  endDate: z.coerce.date({ required_error: "End date is required", invalid_type_error: "Invalid end date" }),
  discountType: z.enum(["PERCENT", "AMOUNT"], { required_error: "Discount type is required" }),
  discount: z.coerce.number({ invalid_type_error: "Discount must be a number" }).gt(0, "Discount must be greater than 0").max(10_000_000),
  status: bool.default(true),
});
export const CreateCouponSchema = couponShape
  .refine((c) => c.endDate >= c.startDate, { message: "End date must be after the start date", path: ["endDate"] })
  .refine((c) => c.discountType !== "PERCENT" || c.discount <= 100, { message: "A percentage discount cannot exceed 100", path: ["discount"] });
export const UpdateCouponSchema = atLeastOne(couponShape);

const shippingShape = z.object({
  name: name("Shipping name", 80),
  type: z.enum(["flat_cost", "min_cost"], { errorMap: () => ({ message: "Choose flat cost or minimum order cost" }) }).default("flat_cost"),
  minCost: money("Minimum order cost").default(0),
  cost: money("Shipping cost"),
  status: bool.default(true),
});
export const CreateShippingRuleSchema = shippingShape;
export const UpdateShippingRuleSchema = atLeastOne(shippingShape);

export const UpdateAdvertisementSchema = z.object({
  key: z.string({ required_error: "Key is required" }).trim().regex(/^[a-z0-9_]{3,60}$/, "Key may only contain lowercase letters, numbers and _"),
  value: z
    .object({ banner: optionalImage, url: link.nullish(), status: bool.optional() })
    .passthrough(),
});

// ---------- blog ----------
const blogCategoryShape = z.object({ name: name("Category name", 80), status: bool.default(true) });
export const CreateBlogCategorySchema = blogCategoryShape;
export const UpdateBlogCategorySchema = atLeastOne(blogCategoryShape);

const blogShape = z.object({
  categoryId: uuid("Category"),
  title: name("Title", 160),
  image: requiredImage,
  description: z.string({ required_error: "Content is required" }).trim().min(20, "Content must be at least 20 characters").max(50000),
  seoTitle: optionalText(70),
  seoDescription: optionalText(300),
  status: bool.default(true),
});
export const CreateBlogSchema = blogShape;
export const UpdateBlogSchema = atLeastOne(blogShape);

export const UpdateContactMessageSchema = z.object({ isRead: bool });

export const BroadcastMailSchema = z.object({
  subject: z.string({ required_error: "Subject is required" }).trim().min(3, "Subject is too short").max(150),
  message: z.string({ required_error: "Message is required" }).trim().min(10, "Message must be at least 10 characters").max(5000),
});

// ---------- settings ----------
const isTimeZone = (tz: string) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};
export const UpdateGeneralSettingSchema = z.object({
  siteName: name("Site name", 100),
  contactEmail: z.preprocess((v) => (v === "" ? null : v), z.string().trim().toLowerCase().email("Invalid email address").max(254).nullish()),
  contactPhone: z.preprocess((v) => (v === "" ? null : v), PhoneSchema.nullish()),
  contactAddress: optionalText(300),
  mapUrl: optionalText(2000),
  currencyName: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, "Use a 3-letter currency code, e.g. INR"),
  currencyIcon: z.string().trim().min(1, "Currency symbol is required").max(5),
  timeZone: z.string().trim().refine(isTimeZone, "Unknown time zone"),
});

export const UpdateEmailSettingSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address").max(254),
  host: z.string().trim().min(1, "Host is required").max(200),
  username: z.string().trim().min(1, "Username is required").max(200),
  password: z.string().max(200).optional(), // blank / masked = keep the stored password
  port: z.coerce.number().int().min(1).max(65535).default(587),
  encryption: z.enum(["tls", "ssl", "none"]).default("tls"),
});

export const UpdatePusherSettingSchema = z.object({
  appId: z.string().trim().min(1).max(100),
  key: z.string().trim().min(1).max(100),
  secret: z.string().max(200).optional(), // blank / masked = keep the stored secret
  cluster: z.string().trim().min(1).max(20).default("mt1"),
});

/** Online payments run through Razorpay (keys come from the server environment) plus cash on delivery. */
export const UpdatePaymentGatewaySchema = z.discriminatedUnion("gateway", [
  z.object({
    gateway: z.literal("RAZORPAY"),
    settings: z.object({
      status: bool.optional(),
      countryName: optionalText(60),
      currencyName: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, "Use a 3-letter currency code").optional(),
      currencyRate: z.coerce.number().gt(0, "Rate must be greater than 0").max(100000).optional(),
    }),
  }),
  z.object({ gateway: z.literal("COD"), settings: z.object({ status: bool }) }),
]);
