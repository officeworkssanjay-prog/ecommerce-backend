import { Router } from "express";
import {
  AddressInputSchema,
  ChangePasswordSchema,
  CreateReviewSchema,
  IdParamSchema,
  ProductIdParamSchema,
  UpdateAddressSchema,
  UpdateProfileSchema,
} from "@ecommerce/shared-types";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/errors";

const router = Router();

// All customer routes require authentication
router.use(authenticate);

// Profile
router.get("/profile", asyncHandler(UserController.getProfile));
router.put("/profile", validate({ body: UpdateProfileSchema }), asyncHandler(UserController.updateProfile));
router.post("/change-password", validate({ body: ChangePasswordSchema }), asyncHandler(UserController.changePassword));

// Addresses
router.get("/addresses", asyncHandler(UserController.getAddresses));
router.post("/addresses", validate({ body: AddressInputSchema }), asyncHandler(UserController.createAddress));
router.put("/addresses/:id", validate({ params: IdParamSchema, body: UpdateAddressSchema }), asyncHandler(UserController.updateAddress));
router.delete("/addresses/:id", validate({ params: IdParamSchema }), asyncHandler(UserController.deleteAddress));
router.put("/addresses/:id/default", validate({ params: IdParamSchema }), asyncHandler(UserController.setDefaultAddress));

// Wishlist
router.get("/wishlist", asyncHandler(UserController.getWishlist));
router.post("/wishlist/:productId", validate({ params: ProductIdParamSchema }), asyncHandler(UserController.addToWishlist));
router.delete("/wishlist/:productId", validate({ params: ProductIdParamSchema }), asyncHandler(UserController.removeFromWishlist));

// Product Reviews
router.get("/reviews", asyncHandler(UserController.getUserReviews));
router.post("/reviews", validate({ body: CreateReviewSchema }), asyncHandler(UserController.createReview));

export default router;
