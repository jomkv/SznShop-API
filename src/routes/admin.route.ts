import { Router } from "express";

// * Middlewares
import { adminProtect } from "../middlewares/auth.middleware";

// * Controllers
import {
  getDashboardStats,
  getOverview,
  getHomeImages,
  setHomeImages,
} from "../controllers/admin.controller";
import uploader from "../middlewares/upload.middleware";

const router = Router();

router.route("/dashboard").get(adminProtect, getDashboardStats);
router.route("/overview").get(adminProtect, getOverview);
router
  .route("/home-images")
  .get(getHomeImages)
  .post(adminProtect, uploader(6), setHomeImages);

export default router;
