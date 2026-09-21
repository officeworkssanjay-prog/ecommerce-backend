import { Router } from "express";
import { VendorController } from "../controllers/vendor.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

// Protect all routes: Must be authenticated and have VENDOR role
router.use(authenticate, requireRole("VENDOR"));

router.get("/dashboard", VendorController.getDashboard);
router.get("/products", VendorController.getProducts);
router.post("/products", VendorController.createProduct);
router.get("/orders", VendorController.getOrders);
router.put("/orders/:orderId/status", VendorController.updateOrderStatus);
router.post("/withdrawals", VendorController.requestWithdrawal);

export default router;
