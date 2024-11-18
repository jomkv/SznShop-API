import { Router } from "express";

// * Middlewares
import { protect } from "../middlewares/auth.middleware";
import checkParamIds from "../middlewares/objectId.middleware";

// * Controllers
import { addToCart } from "../controllers/cart.controller";

const router = Router();

router.route("/:id").post(protect, checkParamIds, addToCart);

export default router;
