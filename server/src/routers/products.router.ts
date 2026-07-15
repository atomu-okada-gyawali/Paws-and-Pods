import { Router } from "express";
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from "../controllers/products.controller.js";
import { requireAuth, requireRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", requireAuth, requireRoles(["ADMIN"]), createProduct);
router.patch("/:id", requireAuth, requireRoles(["ADMIN"]), updateProduct);
router.delete("/:id", requireAuth, requireRoles(["ADMIN"]), deleteProduct);

export { router as productsRouter };
export default router;
