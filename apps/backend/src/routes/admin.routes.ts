import { RequestHandler, Router } from "express";
import { ZodTypeAny } from "zod";
import {
  AddFlashSaleProductSchema,
  AdminOrdersQuerySchema,
  AdminUsersQuerySchema,
  BroadcastMailSchema,
  CreateBlogCategorySchema,
  CreateBlogSchema,
  CreateBrandSchema,
  CreateCategorySchema,
  CreateChildCategorySchema,
  CreateCouponSchema,
  CreateProductAdminSchema,
  CreateShippingRuleSchema,
  CreateSliderSchema,
  CreateSubCategorySchema,
  CreateUserSchema,
  IdParamSchema,
  ReviewStatusSchema,
  UpdateAdvertisementSchema,
  UpdateBlogCategorySchema,
  UpdateBlogSchema,
  UpdateBrandSchema,
  UpdateContactMessageSchema,
  UpdateCategorySchema,
  UpdateChildCategorySchema,
  UpdateCouponSchema,
  UpdateEmailSettingSchema,
  UpdateFlashSaleSchema,
  UpdateGeneralSettingSchema,
  UpdateOrderStatusSchema,
  UpdatePaymentGatewaySchema,
  UpdateProductAdminSchema,
  UpdatePusherSettingSchema,
  UpdateShippingRuleSchema,
  UpdateSliderSchema,
  UpdateSubCategorySchema,
  UpdateUserStatusSchema,
} from "@ecommerce/shared-types";
import { AdminController as C } from "../controllers/admin.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";

const router = Router();

// Protect all routes: Must be authenticated and have ADMIN role
router.use(authenticate, requireRole("ADMIN"));

const id = { params: IdParamSchema };

/** list / create / update / delete for one resource, each write validated. */
function resource(
  path: string,
  h: { list: RequestHandler; create: RequestHandler; update: RequestHandler; remove: RequestHandler },
  create: ZodTypeAny,
  update: ZodTypeAny
) {
  router.get(path, h.list);
  router.post(path, validate({ body: create }), h.create);
  router.put(`${path}/:id`, validate({ ...id, body: update }), h.update);
  router.delete(`${path}/:id`, validate(id), h.remove);
}

// 1. Dashboard & Analytics
router.get("/dashboard", C.getDashboard);

// 2. User & Customer Management
router.get("/users", validate({ query: AdminUsersQuerySchema }), C.getUsers);
router.post("/users", validate({ body: CreateUserSchema }), C.createUser);
router.put("/users/:id/status", validate({ ...id, body: UpdateUserStatusSchema }), C.updateUserStatus);

// 3. Hero Sliders
resource("/sliders", { list: C.getSliders, create: C.createSlider, update: C.updateSlider, remove: C.deleteSlider }, CreateSliderSchema, UpdateSliderSchema);

// 4. Category hierarchy
resource("/categories", { list: C.getCategories, create: C.createCategory, update: C.updateCategory, remove: C.deleteCategory }, CreateCategorySchema, UpdateCategorySchema);
resource("/sub-categories", { list: C.getSubCategories, create: C.createSubCategory, update: C.updateSubCategory, remove: C.deleteSubCategory }, CreateSubCategorySchema, UpdateSubCategorySchema);
resource("/child-categories", { list: C.getChildCategories, create: C.createChildCategory, update: C.updateChildCategory, remove: C.deleteChildCategory }, CreateChildCategorySchema, UpdateChildCategorySchema);

// 5. Brands
resource("/brands", { list: C.getBrands, create: C.createBrand, update: C.updateBrand, remove: C.deleteBrand }, CreateBrandSchema, UpdateBrandSchema);

// 6. Products
resource("/products", { list: C.getProducts, create: C.createProduct, update: C.updateProduct, remove: C.deleteProduct }, CreateProductAdminSchema, UpdateProductAdminSchema);

// 7. Product reviews moderation
router.get("/reviews", C.getReviews);
router.put("/reviews/:id/status", validate({ ...id, body: ReviewStatusSchema }), C.updateReviewStatus);

// 8. Orders & logistics pipeline
router.get("/orders", validate({ query: AdminOrdersQuerySchema }), C.getOrders);
router.put("/orders/:id/status", validate({ ...id, body: UpdateOrderStatusSchema }), C.updateOrderStatus);

// 9. Promotions, flash sale, coupons, shipping
router.get("/flash-sale", C.getFlashSale);
router.put("/flash-sale", validate({ body: UpdateFlashSaleSchema }), C.updateFlashSale);
router.post("/flash-sale/products", validate({ body: AddFlashSaleProductSchema }), C.addFlashSaleProduct);
router.delete("/flash-sale/products/:id", validate(id), C.removeFlashSaleProduct);

resource("/coupons", { list: C.getCoupons, create: C.createCoupon, update: C.updateCoupon, remove: C.deleteCoupon }, CreateCouponSchema, UpdateCouponSchema);
resource("/shipping-rules", { list: C.getShippingRules, create: C.createShippingRule, update: C.updateShippingRule, remove: C.deleteShippingRule }, CreateShippingRuleSchema, UpdateShippingRuleSchema);

router.get("/advertisements", C.getAdvertisements);
router.put("/advertisements", validate({ body: UpdateAdvertisementSchema }), C.updateAdvertisement);

// 10. Blog & CMS
resource("/blog-categories", { list: C.getBlogCategories, create: C.createBlogCategory, update: C.updateBlogCategory, remove: C.deleteBlogCategory }, CreateBlogCategorySchema, UpdateBlogCategorySchema);
resource("/blogs", { list: C.getBlogs, create: C.createBlog, update: C.updateBlog, remove: C.deleteBlog }, CreateBlogSchema, UpdateBlogSchema);

router.get("/blog-comments", C.getBlogComments);
router.put("/blog-comments/:id/status", validate({ ...id, body: ReviewStatusSchema }), C.updateBlogCommentStatus);
router.delete("/blog-comments/:id", validate(id), C.deleteBlogComment);

// 10b. Contact-form inbox
router.get("/messages", C.getContactMessages);
router.put("/messages/:id", validate({ ...id, body: UpdateContactMessageSchema }), C.updateContactMessage);
router.delete("/messages/:id", validate(id), C.deleteContactMessage);

// 11. Newsletter subscribers
router.get("/subscribers", C.getSubscribers);
router.post("/subscribers/send-mail", validate({ body: BroadcastMailSchema }), C.sendSubscribersMail);

// 12. Global platform settings
router.get("/settings", C.getSettings);
router.put("/settings/general", validate({ body: UpdateGeneralSettingSchema }), C.updateGeneralSetting);
router.put("/settings/email", validate({ body: UpdateEmailSettingSchema }), C.updateEmailSetting);
router.put("/settings/pusher", validate({ body: UpdatePusherSettingSchema }), C.updatePusherSetting);
router.put("/settings/payment-gateways", validate({ body: UpdatePaymentGatewaySchema }), C.updatePaymentGatewaySettings);

export default router;
