import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

// Protect all routes: Must be authenticated and have ADMIN role
router.use(authenticate, requireRole("ADMIN"));

// 1. Dashboard & Analytics
router.get("/dashboard", AdminController.getDashboard);

// 2. User & Customer Management
router.get("/users", AdminController.getUsers);
router.post("/users", AdminController.createUser);
router.put("/users/:id/status", AdminController.updateUserStatus);

// 3. Hero Sliders CRUD
router.get("/sliders", AdminController.getSliders);
router.post("/sliders", AdminController.createSlider);
router.put("/sliders/:id", AdminController.updateSlider);
router.delete("/sliders/:id", AdminController.deleteSlider);

// 4. Category Hierarchy CRUD
router.get("/categories", AdminController.getCategories);
router.post("/categories", AdminController.createCategory);
router.put("/categories/:id", AdminController.updateCategory);
router.delete("/categories/:id", AdminController.deleteCategory);

router.get("/sub-categories", AdminController.getSubCategories);
router.post("/sub-categories", AdminController.createSubCategory);
router.put("/sub-categories/:id", AdminController.updateSubCategory);
router.delete("/sub-categories/:id", AdminController.deleteSubCategory);

router.get("/child-categories", AdminController.getChildCategories);
router.post("/child-categories", AdminController.createChildCategory);
router.put("/child-categories/:id", AdminController.updateChildCategory);
router.delete("/child-categories/:id", AdminController.deleteChildCategory);

// 5. Brands CRUD
router.get("/brands", AdminController.getBrands);
router.post("/brands", AdminController.createBrand);
router.put("/brands/:id", AdminController.updateBrand);
router.delete("/brands/:id", AdminController.deleteBrand);

// 6. Platform Products
router.get("/products", AdminController.getProducts);
router.post("/products", AdminController.createProduct);
router.put("/products/:id", AdminController.updateProduct);
router.delete("/products/:id", AdminController.deleteProduct);

// 7. Product Reviews Moderation
router.get("/reviews", AdminController.getReviews);
router.put("/reviews/:id/status", AdminController.updateReviewStatus);

// 8. Orders & Logistics Pipeline
router.get("/orders", AdminController.getOrders);
router.put("/orders/:id/status", AdminController.updateOrderStatus);

// 9. Promotions, Flash Sales, Coupons & Shipping Rules
router.get("/flash-sale", AdminController.getFlashSale);
router.put("/flash-sale", AdminController.updateFlashSale);
router.post("/flash-sale/products", AdminController.addFlashSaleProduct);
router.delete("/flash-sale/products/:id", AdminController.removeFlashSaleProduct);

router.get("/coupons", AdminController.getCoupons);
router.post("/coupons", AdminController.createCoupon);
router.put("/coupons/:id", AdminController.updateCoupon);
router.delete("/coupons/:id", AdminController.deleteCoupon);

router.get("/shipping-rules", AdminController.getShippingRules);
router.post("/shipping-rules", AdminController.createShippingRule);
router.put("/shipping-rules/:id", AdminController.updateShippingRule);
router.delete("/shipping-rules/:id", AdminController.deleteShippingRule);

router.get("/advertisements", AdminController.getAdvertisements);
router.put("/advertisements", AdminController.updateAdvertisement);

// 10. Blog & CMS Content
router.get("/blog-categories", AdminController.getBlogCategories);
router.post("/blog-categories", AdminController.createBlogCategory);
router.put("/blog-categories/:id", AdminController.updateBlogCategory);
router.delete("/blog-categories/:id", AdminController.deleteBlogCategory);

router.get("/blogs", AdminController.getBlogs);
router.post("/blogs", AdminController.createBlog);
router.put("/blogs/:id", AdminController.updateBlog);
router.delete("/blogs/:id", AdminController.deleteBlog);

router.get("/blog-comments", AdminController.getBlogComments);
router.put("/blog-comments/:id/status", AdminController.updateBlogCommentStatus);
router.delete("/blog-comments/:id", AdminController.deleteBlogComment);

// 11. Newsletter Subscribers
router.get("/subscribers", AdminController.getSubscribers);
router.post("/subscribers/send-mail", AdminController.sendSubscribersMail);

// 12. Global Platform Settings
router.get("/settings", AdminController.getSettings);
router.put("/settings/general", AdminController.updateGeneralSetting);
router.put("/settings/email", AdminController.updateEmailSetting);
router.put("/settings/pusher", AdminController.updatePusherSetting);
router.put("/settings/payment-gateways", AdminController.updatePaymentGatewaySettings);

export default router;
