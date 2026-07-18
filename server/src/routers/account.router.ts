import { Router } from "express";
import { exportData, importData, activity, getProfile, updateProfile } from "../controllers/account.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.get("/export", exportData);
router.post("/import", importData);
router.get("/activity", activity);

export { router as accountRouter };
export default router;
