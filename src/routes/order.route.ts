import { Router } from "express";

// * Middlewares
import { protect, adminProtect } from "../middlewares/auth.middleware";
import checkParamIds from "../middlewares/objectId.middleware";

// * Controllers
import {
  getMyOrders,
  getAllOrders,
  getOrder,
  createOrder,
  cancelOrder,
  acceptOrder,
  rejectOrder,
  receivedOrder,
} from "../controllers/order.controller";

const router = Router();

router.route("/").get(protect, getMyOrders).post(protect, createOrder);
router.route("/all").get(adminProtect, getAllOrders);
router.route("/:id").get(protect, getOrder);
router.route("/:id/cancel").post(protect, checkParamIds, cancelOrder);
router.route("/:id/accept").patch(adminProtect, checkParamIds, acceptOrder);
router.route("/:id/reject").patch(adminProtect, checkParamIds, rejectOrder);
router.route("/:id/received").patch(adminProtect, checkParamIds, receivedOrder);

export default router;
