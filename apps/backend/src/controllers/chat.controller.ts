import { Request, Response } from "express";
import { prisma } from "@ecommerce/database";

export class ChatController {
  /**
   * Get all conversations / recent chats for the current user
   */
  static async getConversations(req: Request, res: Response) {
    try {
      const currentUserId = req.user!.id;

      // Find all messages involving current user
      const messages = await prisma.chat.findMany({
        where: {
          OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
        },
        orderBy: { createdAt: "desc" },
        include: {
          sender: { select: { id: true, name: true, avatar: true, role: true } },
          receiver: { select: { id: true, name: true, avatar: true, role: true } },
        },
      });

      // Group by distinct conversation partner
      const conversationsMap = new Map<string, any>();

      for (const msg of messages) {
        const partner = msg.senderId === currentUserId ? msg.receiver : msg.sender;
        if (!conversationsMap.has(partner.id)) {
          conversationsMap.set(partner.id, {
            partner,
            lastMessage: {
              id: msg.id,
              message: msg.message,
              senderId: msg.senderId,
              seen: msg.seen,
              createdAt: msg.createdAt,
            },
            unseenCount:
              msg.receiverId === currentUserId && !msg.seen ? 1 : 0,
          });
        } else if (msg.receiverId === currentUserId && !msg.seen) {
          const conv = conversationsMap.get(partner.id);
          conv.unseenCount += 1;
        }
      }

      return res.json({
        success: true,
        data: Array.from(conversationsMap.values()),
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get messages between authenticated user and a specific user
   */
  static async getMessages(req: Request, res: Response) {
    try {
      const currentUserId = req.user!.id;
      const { receiverId } = req.params;

      // Mark incoming unread messages as seen
      await prisma.chat.updateMany({
        where: {
          senderId: receiverId,
          receiverId: currentUserId,
          seen: false,
        },
        data: { seen: true },
      });

      // Fetch message history
      const messages = await prisma.chat.findMany({
        where: {
          OR: [
            { senderId: currentUserId, receiverId },
            { senderId: receiverId, receiverId: currentUserId },
          ],
        },
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
        },
      });

      return res.json({ success: true, data: messages });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Send a new message
   */
  static async sendMessage(req: Request, res: Response) {
    try {
      const currentUserId = req.user!.id;
      const { receiverId, message } = req.body;

      if (!receiverId || !message) {
        return res.status(400).json({
          success: false,
          message: "Receiver ID and message content are required",
        });
      }

      const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
      if (!receiver) {
        return res.status(404).json({ success: false, message: "Recipient user not found" });
      }

      const chat = await prisma.chat.create({
        data: {
          senderId: currentUserId,
          receiverId,
          message,
          seen: false,
        },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          receiver: { select: { id: true, name: true, avatar: true } },
        },
      });

      return res.status(201).json({
        success: true,
        message: "Message sent",
        data: chat,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
