import { Router } from "express";
import { listOrders, getOrder, updateOrderStatus } from "../controllers/orders.controller.js";
import { requireAuth, requireRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireRoles(["ADMIN"]));

router.get("/", listOrders);
router.get("/:id", getOrder);
router.patch("/:id/status", updateOrderStatus);

export { router as ordersRouter };
export default router;
