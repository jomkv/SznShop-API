import { Router } from "express";

// * Middlewares
import { adminProtect, protect } from "../middlewares/auth.middleware";
import checkParamIds from "../middlewares/objectId.middleware";

// * Controllers
import {
  getUsers,
  getUsernameAndName,
  editProfile,
  banUser,
  getMe,
} from "../controllers/user.controller";

const router = Router();

router.route("/").get(adminProtect, getUsers).put(protect, editProfile);
router.route("/me").get(protect, getMe);
router.route("/username-name").get(protect, getUsernameAndName);
router.route("/:id").post(checkParamIds, adminProtect, banUser);

export default router;
