import { Request, Response } from "express";
import fs from "fs";
import path from "path";

// Ensure destination directories exist
const backendUploads = path.join(__dirname, "../../uploads");
const frontendUploads = path.join(__dirname, "../../../frontend/public/uploads");

[backendUploads, frontendUploads].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      console.error(`Could not create directory ${dir}:`, e);
    }
  }
});

export class UploadController {
  /**
   * Handle image upload (supports both Multer file and Base64 JSON)
   */
  static async uploadImage(req: Request, res: Response) {
    try {
      // 1. Check if uploaded via Multer (multipart/form-data)
      if (req.file) {
        const filename = req.file.filename;
        const srcPath = req.file.path;

        // Copy to frontend public/uploads for instant client preview
        const destFrontend = path.join(frontendUploads, filename);
        try {
          fs.copyFileSync(srcPath, destFrontend);
        } catch (copyErr) {
          // ignore if copy fails
        }

        const fileUrl = `/uploads/${filename}`;
        return res.json({
          success: true,
          message: "Image uploaded successfully",
          url: fileUrl,
          filename,
        });
      }

      // 2. Check if sent as Base64 JSON
      const { image, filename: clientFilename } = req.body;
      if (image && typeof image === "string") {
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let ext = ".jpg";
        let base64Data = image;

        if (matches && matches.length === 3) {
          const mime = matches[1];
          base64Data = matches[2];
          if (mime.includes("png")) ext = ".png";
          else if (mime.includes("webp")) ext = ".webp";
          else if (mime.includes("gif")) ext = ".gif";
        }

        const safeName = (clientFilename || "img")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .substring(0, 30);
        const filename = `${Date.now()}-${safeName}${ext}`;

        const buffer = Buffer.from(base64Data, "base64");
        const backendPath = path.join(backendUploads, filename);
        fs.writeFileSync(backendPath, buffer);

        const frontendPath = path.join(frontendUploads, filename);
        try {
          fs.writeFileSync(frontendPath, buffer);
        } catch (e) {
          // ignore
        }

        const fileUrl = `/uploads/${filename}`;
        return res.json({
          success: true,
          message: "Image uploaded successfully",
          url: fileUrl,
          filename,
        });
      }

      return res.status(400).json({
        success: false,
        message: "No image file or base64 data provided",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to process image upload",
      });
    }
  }
}
