import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

// Protect all routes: Must be authenticated and have ADMIN role
router.use(authenticate, requireRole("ADMIN"));

router.get("/dashboard", AdminController.getDashboard);

// Product Moderation
router.get("/pending-products", AdminController.getPendingProducts);
router.put("/products/:id/approval", AdminController.updateProductApproval);

// Orders & Global Logistics
router.get("/orders", AdminController.getOrders);
router.put("/orders/:id/status", AdminController.updateOrderStatus);

// Merchant Withdrawals
router.get("/withdrawals", AdminController.getWithdrawals);
router.put("/withdrawals/:id/status", AdminController.updateWithdrawalStatus);

// Vendor Applications
router.get("/vendor-requests", AdminController.getVendorRequests);
router.post("/vendor-requests/:id/approve", AdminController.approveVendor);

export default router;
