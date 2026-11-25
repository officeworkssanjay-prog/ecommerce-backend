import { Request, Response } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { AppError } from "../utils/errors";

export const uploadsDir = path.join(__dirname, "../../uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

/** Identifies the real image type from the file's first bytes (never trusts client mime/extension). */
export function detectImageExtension(buf: Buffer): ".png" | ".jpg" | ".gif" | ".webp" | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return ".png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return ".jpg";
  if (buf.toString("ascii", 0, 4) === "GIF8") return ".gif";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return ".webp";
  return null; // SVG and everything else is rejected
}

export class UploadController {
  /** Accepts a multipart `image` file or a base64 JSON body `{ image: "data:image/...;base64,..." }`. */
  static async uploadImage(req: Request, res: Response) {
    let buffer: Buffer | null = null;

    if (req.file) {
      buffer = req.file.buffer;
    } else if (typeof req.body?.image === "string") {
      const match = req.body.image.match(/^data:image\/[A-Za-z0-9.+-]+;base64,([A-Za-z0-9+/=\s]+)$/);
      if (!match) throw AppError.badRequest("Image must be a base64 data URL");
      // 4 base64 chars encode 3 bytes: reject oversize before decoding
      if ((match[1].length * 3) / 4 > MAX_IMAGE_BYTES) throw AppError.badRequest("Image must be 5MB or smaller");
      buffer = Buffer.from(match[1], "base64");
    }

    if (!buffer || buffer.length === 0) throw AppError.badRequest("No image file or base64 data provided");
    if (buffer.length > MAX_IMAGE_BYTES) throw AppError.badRequest("Image must be 5MB or smaller");

    const ext = detectImageExtension(buffer);
    if (!ext) throw AppError.badRequest("Only PNG, JPEG, GIF or WebP images are allowed");

    const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    await fs.promises.writeFile(path.join(uploadsDir, filename), buffer, { flag: "wx" });

    return res.json({
      success: true,
      message: "Image uploaded successfully",
      url: `/uploads/${filename}`,
      filename,
    });
  }
}
