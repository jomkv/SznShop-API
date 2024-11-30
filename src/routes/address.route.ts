import { Router } from "express";

// * Middlewares
import { protect } from "../middlewares/auth.middleware";
import checkParamIds from "../middlewares/objectId.middleware";

// * Controllers
import {
  createAddress,
  getMyAddresses,
  getAddress,
  deleteAddress,
  editAddress,
  setDefaultAddress,
} from "../controllers/address.controller";

const router = Router();

router.route("/").get(protect, getMyAddresses).post(protect, createAddress);
router
  .route("/:id")
  .get(protect, checkParamIds, getAddress)
  .put(protect, checkParamIds, editAddress)
  .delete(protect, checkParamIds, deleteAddress);

router.route("/:id/set-default").put(protect, checkParamIds, setDefaultAddress);

export default router;
