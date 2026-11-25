import { Router } from "express";
import {
  CheckoutSchema,
  OrderIdParamSchema,
  PricingRequestSchema,
  TrackOrderParamsSchema,
  TrackOrderQuerySchema,
  VerifyPaymentSchema,
} from "@ecommerce/shared-types";
import { OrderController } from "../controllers/order.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { createLimiter } from "../middlewares/rate-limit";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/errors";

const router = Router();

const trackLimiter = createLimiter(15, 30, "Too many tracking attempts. Please try again later.");

router.post("/calculate-pricing", validate({ body: PricingRequestSchema }), asyncHandler(OrderController.calculatePricing));
router.get(
  "/track/:invoiceId",
  trackLimiter,
  validate({ params: TrackOrderParamsSchema, query: TrackOrderQuerySchema }),
  asyncHandler(OrderController.trackOrder)
);

// Protected routes
router.post("/checkout", authenticate, validate({ body: CheckoutSchema }), asyncHandler(OrderController.checkout));
router.post("/payment/verify", authenticate, validate({ body: VerifyPaymentSchema }), asyncHandler(OrderController.verifyPayment));
router.post("/:id/cancel", authenticate, validate({ params: OrderIdParamSchema }), asyncHandler(OrderController.cancelOrder));
router.get("/user/orders", authenticate, asyncHandler(OrderController.getUserOrders));

export default router;
