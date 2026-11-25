import { Router } from "express";
import {
  BlogCommentSchema,
  BlogListQuerySchema,
  ContactSchema,
  IdParamSchema,
  NewsletterSchema,
  ProductFilterSchema,
  SlugParamSchema,
} from "@ecommerce/shared-types";
import { z } from "zod";
import { StorefrontController } from "../controllers/storefront.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/errors";

const router = Router();

// Homepage & Core Catalog
router.get("/home", asyncHandler(StorefrontController.getHomeData));
router.get("/products", validate({ query: ProductFilterSchema }), asyncHandler(StorefrontController.getProducts));
router.get("/products/:slug", validate({ params: SlugParamSchema }), asyncHandler(StorefrontController.getProductBySlug));
router.get("/flash-sale", asyncHandler(StorefrontController.getFlashSale));
router.get("/categories", asyncHandler(StorefrontController.getCategories));
router.get("/brands", asyncHandler(StorefrontController.getBrands));
router.get("/shipping-rules", asyncHandler(StorefrontController.getShippingRules));

// Blog & CMS
router.get("/blogs", validate({ query: BlogListQuerySchema }), asyncHandler(StorefrontController.getBlogs));
router.get("/blogs/:slug", validate({ params: SlugParamSchema }), asyncHandler(StorefrontController.getBlogBySlug));
router.post(
  "/blogs/:id/comments",
  authenticate,
  validate({ params: IdParamSchema, body: BlogCommentSchema }),
  asyncHandler(StorefrontController.addBlogComment)
);

// Marketing, Ads & Newsletter
router.get("/advertisements", asyncHandler(StorefrontController.getAdvertisements));
router.post("/newsletter-subscribe", validate({ body: NewsletterSchema }), asyncHandler(StorefrontController.subscribeNewsletter));
router.get(
  "/newsletter-verify/:token",
  validate({ params: z.object({ token: z.string().regex(/^[a-f0-9]{48}$/i, "Invalid or expired token") }) }),
  asyncHandler(StorefrontController.verifyNewsletter)
);

// Inquiries & Contact
router.post("/contact", validate({ body: ContactSchema }), asyncHandler(StorefrontController.handleContactInquiry));

export default router;
