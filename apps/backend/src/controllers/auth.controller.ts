import { CookieOptions, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma, Role } from "@ecommerce/database";
import { LoginInput, RegisterInput } from "@ecommerce/shared-types";
import { env } from "../config/env";
import { AppError } from "../utils/errors";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "lax",
  path: "/",
};

function issueSession(res: Response, user: { id: string; email: string; role: string }) {
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("auth_token", token, { ...cookieOptions, maxAge: SEVEN_DAYS_MS });
  return token;
}

// Compared against when the email is unknown so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

/** Handlers run behind `validate()` + `asyncHandler()`, so req.body is already parsed. */
export class AuthController {
  static async register(req: Request, res: Response) {
    const { name, email, password } = req.body as RegisterInput;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw AppError.conflict("Email address is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: Role.USER },
    });

    const token = issueSession(res, user);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body as LoginInput;

    const user = await prisma.user.findUnique({ where: { email } });
    const isMatch = await bcrypt.compare(password, user?.password || DUMMY_HASH);

    if (!user || !user.password || !isMatch) {
      throw AppError.unauthorized("Invalid email or password");
    }

    if (!user.status) {
      throw AppError.forbidden("Your account has been deactivated. Please contact support.");
    }

    const token = issueSession(res, user);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  }

  static async me(req: Request, res: Response) {
    return res.json({ success: true, user: req.user });
  }

  static async logout(_req: Request, res: Response) {
    res.clearCookie("auth_token", cookieOptions);
    return res.json({ success: true, message: "Logged out successfully" });
  }
}
