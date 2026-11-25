import { Router } from "express";
import { ChatReceiverParamSchema, ChatSendSchema } from "@ecommerce/shared-types";
import { ChatController } from "../controllers/chat.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { createLimiter } from "../middlewares/rate-limit";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/errors";

const router = Router();

// All chat routes require authentication
router.use(authenticate);

const sendLimiter = createLimiter(1, 20, "You are sending messages too quickly. Please slow down.");

router.get("/support-agent", asyncHandler(ChatController.getSupportAgent));
router.get("/conversations", asyncHandler(ChatController.getConversations));
router.get("/messages/:receiverId", validate({ params: ChatReceiverParamSchema }), asyncHandler(ChatController.getMessages));
router.post("/send", sendLimiter, validate({ body: ChatSendSchema }), asyncHandler(ChatController.sendMessage));

export default router;
