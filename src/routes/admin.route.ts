import { Router } from "express";

// * Middlewares
import { adminProtect } from "../middlewares/auth.middleware";

// * Controllers
import { getDashboardStats } from "../controllers/admin.controller";

const router = Router();

router.route("/dashboard").get(adminProtect, getDashboardStats);

export default router;
