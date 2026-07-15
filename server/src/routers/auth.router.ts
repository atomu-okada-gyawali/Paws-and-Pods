import { Router } from "express";
import { register, login, refresh, logout, passwordStrength, me, changePassword } from "../controllers/auth.controller.js";
import { setupMfa, enableMfa, disableMfa } from "../controllers/mfa.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/password-strength", passwordStrength);

router.get("/me", requireAuth, me);
router.post("/change-password", requireAuth, changePassword);
router.post("/mfa/setup", requireAuth, setupMfa);
router.post("/mfa/enable", requireAuth, enableMfa);
router.post("/mfa/disable", requireAuth, disableMfa);

export { router as authRouter };
export default router;
