import { Router } from "express";

// * Middlewares
import { protect } from "../middlewares/auth.middleware";
import checkParamIds from "../middlewares/objectId.middleware";

// * Controllers
import {
  createAddress,
  getMyAddresses,
  deleteAddress,
  editAddress,
} from "../controllers/address.controller";

const router = Router();

router.route("/").get(protect, getMyAddresses).post(protect, createAddress);
router
  .route("/:id")
  .put(protect, checkParamIds, editAddress)
  .delete(protect, checkParamIds, deleteAddress);

export default router;
