import { Router } from "express";

// * Middlewares
import { protect } from "../middlewares/auth.middleware";
import checkParamIds from "../middlewares/objectId.middleware";

// * Controllers
import {
  addToCart,
  getCart,
  removeFromCart,
  incrementCartItem,
  decrementCartItem,
} from "../controllers/cart.controller";

const router = Router();

router.route("/").get(protect, getCart);
router
  .route("/:id")
  .post(protect, checkParamIds, addToCart)
  .delete(protect, checkParamIds, removeFromCart);

router.route("/:id/increment").post(protect, checkParamIds, incrementCartItem);
router.route("/:id/decrement").post(protect, checkParamIds, decrementCartItem);

export default router;
