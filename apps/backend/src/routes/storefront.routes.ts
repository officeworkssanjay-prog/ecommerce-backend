import { Router } from "express";
import { StorefrontController } from "../controllers/storefront.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Homepage & Core Catalog
router.get("/home", StorefrontController.getHomeData);
router.get("/products", StorefrontController.getProducts);
router.get("/products/:slug", StorefrontController.getProductBySlug);
router.get("/vendors", StorefrontController.getVendors);
router.get("/flash-sale", StorefrontController.getFlashSale);
router.get("/categories", StorefrontController.getCategories);
router.get("/brands", StorefrontController.getBrands);

// Blog & CMS
router.get("/blogs", StorefrontController.getBlogs);
router.get("/blogs/:slug", StorefrontController.getBlogBySlug);
router.post("/blogs/:id/comments", authenticate, StorefrontController.addBlogComment);

// Marketing, Ads & Newsletter
router.get("/advertisements", StorefrontController.getAdvertisements);
router.post("/newsletter-subscribe", StorefrontController.subscribeNewsletter);
router.get("/newsletter-verify/:token", StorefrontController.verifyNewsletter);

// Inquiries & Contact
router.post("/contact", StorefrontController.handleContactInquiry);

export default router;
