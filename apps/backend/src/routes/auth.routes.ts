import { Router } from "express";
import { LoginSchema, RegisterSchema } from "@ecommerce/shared-types";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/errors";

const router = Router();

router.post("/register", validate({ body: RegisterSchema }), asyncHandler(AuthController.register));
router.post("/login", validate({ body: LoginSchema }), asyncHandler(AuthController.login));
router.get("/me", authenticate, asyncHandler(AuthController.me));
router.post("/logout", asyncHandler(AuthController.logout));

export default router;
