import { Router } from "express";

// * Middlewares
import { protect, adminProtect } from "../middlewares/auth.middleware";
import checkParamIds from "../middlewares/objectId.middleware";

// * Controllers
import {
  getMyOrders,
  getAllOrders,
  createOrder,
  cancelOrder,
} from "../controllers/order.controller";

const router = Router();

router.route("/").get(protect, getMyOrders).post(protect, createOrder);
router.route("/all").get(adminProtect, getAllOrders);
router.route("/:id/cancel").post(protect, checkParamIds, cancelOrder);

export default router;
