import { Router } from "express";
import { listUsers, updateUserRole } from "../controllers/users.controller.js";
import { requireAuth, requireRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireRoles(["ADMIN"]));

router.get("/", listUsers);
router.patch("/:id/role", updateUserRole);

export { router as usersRouter };
export default router;
