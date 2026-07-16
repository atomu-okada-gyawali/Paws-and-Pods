import { Response } from "express";
import multer from "multer";
import { uploadImageMiddleware } from "../middleware/upload.middleware.js";
import { saveImage } from "../services/upload.service.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export function uploadImage(req: AuthenticatedRequest, res: Response): void {
  uploadImageMiddleware(req, res, async (err: unknown) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ error: "Image must be 2 MB or smaller." });
        return;
      }
      const message = err instanceof Error ? err.message : "Upload failed.";
      res.status(400).json({ error: message });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No image file was provided." });
      return;
    }

    try {
      const { filename } = await saveImage(req.file.buffer);
      res.status(201).json({ url: `/api/uploads/${filename}` });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid image." });
    }
  });
}
