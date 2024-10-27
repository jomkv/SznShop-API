import { Router } from "express";

// * Middlewares
import { adminProtect } from "../middlewares/auth.middleware";
import validateId from "../middlewares/objectId.middleware";
import uploader from "../middlewares/upload.middleware";

// * Controllers
import {
  createProduct,
  getProduct,
  getProductsHome,
  editProduct,
  deleteProduct,
} from "../controllers/product.controller";

const router = Router();

router.route("/").post(adminProtect, uploader, createProduct);

router.route("/home").get(getProductsHome);

router
  .route("/:id")
  .get(validateId, getProduct)
  .put(adminProtect, validateId, uploader, editProduct)
  .delete(adminProtect, validateId, deleteProduct);

export default router;
