import { Router } from "express";
import { processCheckout } from "../controllers/checkout.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", requireAuth, processCheckout);

export { router as checkoutRouter };
export default router;
