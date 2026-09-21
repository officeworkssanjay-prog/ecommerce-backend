import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthUserSession, RoleType } from "@ecommerce/shared-types";
import { prisma } from "@ecommerce/database";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserSession;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-in-prod";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const token =
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.cookies?.auth_token) || null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: RoleType;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { vendor: { select: { id: true } } },
    });

    if (!user || !user.status) {
      return res.status(401).json({
        success: false,
        message: "User account inactive or not found",
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as RoleType,
      avatar: user.avatar,
      vendorId: user.vendor?.id || null,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication session",
    });
  }
}
