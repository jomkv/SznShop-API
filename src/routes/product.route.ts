import { Router } from "express";

// * Middlewares
import { adminProtect } from "../middlewares/auth.middleware";
import validateId from "../middlewares/objectId.middleware";
import uploader from "../middlewares/upload.middleware";

// * Controllers
import {
  createProduct,
  getProduct,
  getProductStocks,
  getProductsHome,
  editProduct,
  editProductStocks,
  deleteProduct,
} from "../controllers/product.controller";

const router = Router();

// Centralize validateId middleware for :id parameter
router.param("id", validateId);

router.route("/").post(adminProtect, uploader, createProduct);

router.route("/home").get(getProductsHome);

router
  .route("/:id")
  .get(getProduct)
  .put(adminProtect, uploader, editProduct)
  .delete(adminProtect, deleteProduct);

router
  .route("/:id/stocks")
  .get(adminProtect, getProductStocks)
  .put(adminProtect, editProductStocks);

export default router;
