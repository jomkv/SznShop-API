import { Router } from "express";

// * Middlewares
import { adminProtect } from "../middlewares/auth.middleware";

// * Controllers
import { createProduct } from "../controllers/product.controller";

const router = Router();

router.route("/").post(adminProtect, createProduct);

export default router;
