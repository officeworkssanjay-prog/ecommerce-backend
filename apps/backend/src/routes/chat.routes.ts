import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// All chat routes require authentication
router.use(authenticate);

router.get("/conversations", ChatController.getConversations);
router.get("/messages/:receiverId", ChatController.getMessages);
router.post("/send", ChatController.sendMessage);

export default router;
