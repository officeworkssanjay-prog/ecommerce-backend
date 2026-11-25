import { NextFunction, Request, Response } from "express";
import { Prisma } from "@ecommerce/database";
import { ZodError } from "zod";
import { env } from "../config/env";
import { AppError } from "../utils/errors";
import { formatZodError } from "./validate";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

/** Single place that turns any thrown error into a consistent JSON response. */
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  if (res.headersSent) return;

  if (err instanceof AppError) {
    return res.status(err.status).json({ success: false, message: err.message, errors: err.errors });
  }

  if (err instanceof ZodError) {
    const errors = formatZodError(err);
    return res.status(400).json({
      success: false,
      message: Object.values(errors)[0]?.[0] || "Validation failed",
      errors,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const raw = err.meta?.target;
      const fields = Array.isArray(raw) ? raw : [];
      const message =
        fields.length === 1
          ? `This ${fields[0]} is already in use`
          : "This entry already exists";
      return res.status(409).json({ success: false, message });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
    if (err.code === "P2003") {
      return res
        .status(409)
        .json({ success: false, message: "This record is referenced by other data and cannot be changed" });
    }
  }

  if (err?.name === "MulterError") {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Image must be 5MB or smaller" : "Invalid file upload";
    return res.status(400).json({ success: false, message });
  }

  // Malformed JSON bodies, payload too large, etc. (body-parser sets err.status)
  if (typeof err?.status === "number" && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ success: false, message: err.message });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    message: env.isProduction ? "Internal server error" : err?.message || "Internal server error",
  });
}
