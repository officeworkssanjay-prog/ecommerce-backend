import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// All customer routes require authentication
router.use(authenticate);

// Profile
router.get("/profile", UserController.getProfile);
router.put("/profile", UserController.updateProfile);
router.post("/change-password", UserController.changePassword);

// Addresses
router.get("/addresses", UserController.getAddresses);
router.post("/addresses", UserController.createAddress);
router.put("/addresses/:id", UserController.updateAddress);
router.delete("/addresses/:id", UserController.deleteAddress);
router.put("/addresses/:id/default", UserController.setDefaultAddress);

// Wishlist
router.get("/wishlist", UserController.getWishlist);
router.post("/wishlist/:productId", UserController.addToWishlist);
router.delete("/wishlist/:productId", UserController.removeFromWishlist);

// Product Reviews
router.get("/reviews", UserController.getUserReviews);
router.post("/reviews", UserController.createReview);

// Merchant Application
router.get("/vendor-request", UserController.getVendorRequestStatus);
router.post("/vendor-request", UserController.submitVendorRequest);

export default router;
