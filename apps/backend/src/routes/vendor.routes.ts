import { Router } from "express";
import { VendorController } from "../controllers/vendor.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

// Protect all routes: Must be authenticated and have VENDOR role
router.use(authenticate, requireRole("VENDOR"));

// Dashboard & Analytics
router.get("/dashboard", VendorController.getDashboard);

// Vendor User & Shop Profile
router.get("/profile", VendorController.getProfile);
router.put("/profile", VendorController.updateProfile);
router.get("/shop-profile", VendorController.getShopProfile);
router.put("/shop-profile", VendorController.updateShopProfile);

// Dependent Category Selectors
router.get("/sub-categories/:categoryId", VendorController.getSubCategories);
router.get("/child-categories/:subCategoryId", VendorController.getChildCategories);

// Products Management
router.get("/products", VendorController.getProducts);
router.post("/products", VendorController.createProduct);
router.put("/products/:id/status", VendorController.updateProductStatus);

// Product Variants & Variant Items
router.get("/products/:productId/variants", VendorController.getProductVariants);
router.post("/products/:productId/variants", VendorController.createProductVariant);
router.put("/variants/:id", VendorController.updateProductVariant);
router.delete("/variants/:id", VendorController.deleteProductVariant);

router.get("/variants/:variantId/items", VendorController.getVariantItems);
router.post("/variants/:variantId/items", VendorController.createVariantItem);
router.put("/variant-items/:id", VendorController.updateVariantItem);
router.delete("/variant-items/:id", VendorController.deleteVariantItem);

// Product Image Gallery
router.get("/products/:productId/gallery", VendorController.getGalleryImages);
router.post("/products/:productId/gallery", VendorController.addGalleryImage);
router.delete("/gallery/:id", VendorController.deleteGalleryImage);

// Orders & Status
router.get("/orders", VendorController.getOrders);
router.put("/orders/:orderId/status", VendorController.updateOrderStatus);

// Customer Reviews on Vendor Products
router.get("/reviews", VendorController.getVendorReviews);

// Withdrawals & Methods
router.get("/withdraw-methods", VendorController.getWithdrawMethods);
router.post("/withdrawals", VendorController.requestWithdrawal);

export default router;
