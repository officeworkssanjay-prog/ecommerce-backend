import { Request, Response } from "express";
import { prisma } from "@ecommerce/database";
import { AppError } from "../utils/errors";

const partnerSelect = { id: true, name: true, avatar: true, role: true } as const;

/**
 * Chat is support messaging: buyers talk to the store (ADMIN), admins talk to buyers.
 * Buyers can never message each other.
 */
async function assertCanChat(currentUser: NonNullable<Request["user"]>, partnerId: string) {
  if (partnerId === currentUser.id) throw AppError.badRequest("You cannot message yourself");
  const partner = await prisma.user.findFirst({ where: { id: partnerId, status: true }, select: partnerSelect });
  if (!partner) throw AppError.notFound("Recipient not found");
  if (currentUser.role === "USER" && partner.role !== "ADMIN") {
    throw AppError.forbidden("You can only message the store support team");
  }
  return partner;
}

export class ChatController {
  /** The store admin a buyer should message (the earliest active admin account). */
  static async getSupportAgent(_req: Request, res: Response) {
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN", status: true },
      orderBy: { createdAt: "asc" },
      select: partnerSelect,
    });
    if (!admin) throw AppError.notFound("Support is not available right now");
    return res.json({ success: true, data: admin });
  }

  static async getConversations(req: Request, res: Response) {
    const currentUserId = req.user!.id;

    const messages = await prisma.chat.findMany({
      where: { OR: [{ senderId: currentUserId }, { receiverId: currentUserId }] },
      orderBy: { createdAt: "desc" },
      take: 500,
      include: { sender: { select: partnerSelect }, receiver: { select: partnerSelect } },
    });

    const conversations = new Map<string, { partner: (typeof messages)[number]["sender"]; lastMessage: unknown; unseenCount: number }>();
    for (const msg of messages) {
      const partner = msg.senderId === currentUserId ? msg.receiver : msg.sender;
      const unseen = msg.receiverId === currentUserId && !msg.seen ? 1 : 0;
      const existing = conversations.get(partner.id);
      if (existing) {
        existing.unseenCount += unseen;
      } else {
        conversations.set(partner.id, {
          partner,
          lastMessage: {
            id: msg.id,
            message: msg.message,
            senderId: msg.senderId,
            seen: msg.seen,
            createdAt: msg.createdAt,
          },
          unseenCount: unseen,
        });
      }
    }

    return res.json({ success: true, data: Array.from(conversations.values()) });
  }

  static async getMessages(req: Request, res: Response) {
    const currentUserId = req.user!.id;
    const { receiverId } = req.params;
    await assertCanChat(req.user!, receiverId);

    await prisma.chat.updateMany({
      where: { senderId: receiverId, receiverId: currentUserId, seen: false },
      data: { seen: true },
    });

    const messages = await prisma.chat.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId },
          { senderId: receiverId, receiverId: currentUserId },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 500,
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });

    return res.json({ success: true, data: messages.reverse() });
  }

  static async sendMessage(req: Request, res: Response) {
    const { receiverId, message } = req.body as { receiverId: string; message: string };
    await assertCanChat(req.user!, receiverId);

    const chat = await prisma.chat.create({
      data: { senderId: req.user!.id, receiverId, message, seen: false },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    });

    return res.status(201).json({ success: true, message: "Message sent", data: chat });
  }
}
