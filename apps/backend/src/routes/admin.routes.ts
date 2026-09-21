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

// 3. Vendor Oversight & Governance
router.get("/vendors", AdminController.getVendors);
router.put("/vendors/:id/status", AdminController.updateVendorStatus);
router.get("/vendor-requests", AdminController.getVendorRequests);
router.post("/vendor-requests/:id/approve", AdminController.approveVendor);
router.get("/vendor-condition", AdminController.getVendorCondition);
router.put("/vendor-condition", AdminController.updateVendorCondition);

// 4. Hero Sliders CRUD
router.get("/sliders", AdminController.getSliders);
router.post("/sliders", AdminController.createSlider);
router.put("/sliders/:id", AdminController.updateSlider);
router.delete("/sliders/:id", AdminController.deleteSlider);

// 5. Category Hierarchy CRUD
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

// 6. Brands CRUD
router.get("/brands", AdminController.getBrands);
router.post("/brands", AdminController.createBrand);
router.put("/brands/:id", AdminController.updateBrand);
router.delete("/brands/:id", AdminController.deleteBrand);

// 7. Platform Products & Seller Product Moderation
router.get("/products", AdminController.getProducts);
router.post("/products", AdminController.createProduct);
router.put("/products/:id", AdminController.updateProduct);
router.delete("/products/:id", AdminController.deleteProduct);
router.get("/pending-products", AdminController.getPendingProducts);
router.put("/products/:id/approval", AdminController.updateProductApproval);

// 8. Product Reviews Moderation
router.get("/reviews", AdminController.getReviews);
router.put("/reviews/:id/status", AdminController.updateReviewStatus);

// 9. Orders & Logistics Pipeline
router.get("/orders", AdminController.getOrders);
router.put("/orders/:id/status", AdminController.updateOrderStatus);

// 10. Promotions, Flash Sales, Coupons & Shipping Rules
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

// 11. Vendor Payouts & Methods
router.get("/withdrawals", AdminController.getWithdrawals);
router.put("/withdrawals/:id/status", AdminController.updateWithdrawalStatus);
router.get("/withdraw-methods", AdminController.getWithdrawMethods);
router.post("/withdraw-methods", AdminController.createWithdrawMethod);
router.put("/withdraw-methods/:id", AdminController.updateWithdrawMethod);

// 12. Blog & CMS Content
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

// 13. Newsletter Subscribers
router.get("/subscribers", AdminController.getSubscribers);
router.post("/subscribers/send-mail", AdminController.sendSubscribersMail);

// 14. Global Platform Settings
router.get("/settings", AdminController.getSettings);
router.put("/settings/general", AdminController.updateGeneralSetting);
router.put("/settings/email", AdminController.updateEmailSetting);
router.put("/settings/pusher", AdminController.updatePusherSetting);
router.put("/settings/payment-gateways", AdminController.updatePaymentGatewaySettings);

export default router;
