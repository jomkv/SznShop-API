import { Router } from "express";

// * Middlewares
import { protect, adminProtect } from "../middlewares/auth.middleware";
import { orderProtect } from "../middlewares/owner.middleware";
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
  completeOrder,
} from "../controllers/order.controller";

const router = Router();

router.route("/").get(protect, getMyOrders).post(protect, createOrder);
router.route("/all").get(adminProtect, getAllOrders);
router.route("/:id").get(protect, checkParamIds, orderProtect(true), getOrder);
router
  .route("/:id/cancel")
  .patch(protect, checkParamIds, orderProtect(true), cancelOrder);
router.route("/:id/accept").patch(adminProtect, checkParamIds, acceptOrder);
router.route("/:id/reject").patch(adminProtect, checkParamIds, rejectOrder);
router.route("/:id/received").patch(adminProtect, checkParamIds, receivedOrder);
router
  .route("/:id/complete")
  .patch(protect, checkParamIds, orderProtect(false), completeOrder);

export default router;
