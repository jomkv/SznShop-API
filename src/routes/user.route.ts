import { Router } from "express";

// * Middlewares
import { adminProtect } from "../middlewares/auth.middleware";
import checkParamIds from "../middlewares/objectId.middleware";

// * Controllers
import { getUsers, banUser } from "../controllers/user.controller";

const router = Router();

router.route("/").get(adminProtect, getUsers);
router.route("/:id").post(checkParamIds, adminProtect, banUser);

export default router;
