import { Router } from "express";

// * Middlewares
import { protect } from "../middlewares/auth.middleware";
import checkParamIds from "../middlewares/objectId.middleware";

// * Controllers
import {
  addToCart,
  getCart,
  removeFromCart,
} from "../controllers/cart.controller";

const router = Router();

router.route("/").get(protect, getCart);
router
  .route("/:id")
  .post(protect, checkParamIds, addToCart)
  .delete(protect, checkParamIds, removeFromCart);

export default router;
