import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/calculate-pricing", OrderController.calculatePricing);
router.get("/track/:invoiceId", OrderController.trackOrder);

// Protected routes
router.post("/checkout", authenticate, OrderController.checkout);
router.get("/user/orders", authenticate, OrderController.getUserOrders);

export default router;
