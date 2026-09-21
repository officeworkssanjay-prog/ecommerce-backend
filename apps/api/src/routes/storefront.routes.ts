import { Router } from "express";
import { StorefrontController } from "../controllers/storefront.controller";

const router = Router();

router.get("/home", StorefrontController.getHomeData);
router.get("/products", StorefrontController.getProducts);
router.get("/products/:slug", StorefrontController.getProductBySlug);
router.get("/vendors", StorefrontController.getVendors);

export default router;
