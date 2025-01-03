import { Router } from "express";

// * Middlewares
import { protect } from "../middlewares/auth.middleware";
import checkParamIds from "../middlewares/objectId.middleware";

// * Controllers
import {
  createRating,
  getProductRatings,
} from "../controllers/rating.controller";

const router = Router();

router
  .route("/:id")
  .get(checkParamIds, getProductRatings)
  .post(checkParamIds, protect, createRating);

export default router;
