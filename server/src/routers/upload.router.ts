import { Router } from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// any logged in user can upload (needed for avatars)
router.post("/", requireAuth, uploadImage);

export { router as uploadsRouter };
export default router;
