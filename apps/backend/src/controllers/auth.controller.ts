import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma, Role } from "@ecommerce/database";
import { LoginSchema, RegisterSchema } from "@ecommerce/shared-types";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-in-prod";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const validation = RegisterSchema.safeParse(req.body);
      if (!validation.success) {
        const firstError = validation.error.errors[0]?.message || "Validation error";
        return res.status(400).json({
          success: false,
          message: firstError,
          errors: validation.error.format(),
        });
      }

      const { name, email, password } = validation.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Email address is already registered",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: Role.USER,
        },
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        success: true,
        message: "Registration successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const validation = LoginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          errors: validation.error.format(),
        });
      }

      const { email, password } = validation.data;

      const user = await prisma.user.findUnique({
        where: { email },
        include: { vendor: { select: { id: true, shopName: true } } },
      });

      if (!user || !user.password) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      if (!user.status) {
        return res.status(403).json({
          success: false,
          message: "Your account has been deactivated. Please contact support.",
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          vendor: user.vendor,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async me(req: Request, res: Response) {
    return res.json({
      success: true,
      user: req.user,
    });
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie("auth_token");
    return res.json({ success: true, message: "Logged out successfully" });
  }
}
