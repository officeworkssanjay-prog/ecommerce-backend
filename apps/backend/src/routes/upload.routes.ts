import { Router } from "express";
import multer from "multer";
import { MAX_IMAGE_BYTES, UploadController } from "../controllers/upload.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { createLimiter } from "../middlewares/rate-limit";
import { asyncHandler } from "../utils/errors";

// Files are buffered in memory so the content can be verified before anything is written to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
});

const uploadLimiter = createLimiter(60, 60, "Too many uploads. Please try again later.");

const router = Router();

// Authenticated users only; type/size are verified in the controller.
router.post("/", authenticate, uploadLimiter, upload.single("image"), asyncHandler(UploadController.uploadImage));

export default router;
