import { Router } from "express";

// * Middlewares
import { adminProtect } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload.middleware";

// * Controllers
import { createProduct } from "../controllers/product.controller";

const router = Router();

router.route("/").post(adminProtect, upload.array("images", 4), createProduct);

export default router;
