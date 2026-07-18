import multer from "multer";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 mb

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

// keep it in memory so we can check magic bytes before writing. mime check here is just a first pass
export const uploadImageMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported image type. Allowed: JPEG, PNG, GIF, WEBP."));
    }
  },
}).single("image");
