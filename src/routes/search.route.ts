import { Router } from "express";

// * Middlewares
import { protect } from "../middlewares/auth.middleware";
import checkParamIds from "../middlewares/objectId.middleware";

// * Controllers
import {
  searchProducts,
  getCategories,
} from "../controllers/search.controller";

const router = Router();

router.route("/").get(searchProducts);

router.route("/categories").get(getCategories);

export default router;
