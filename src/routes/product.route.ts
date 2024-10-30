import { Router } from "express";

// * Middlewares
import { adminProtect } from "../middlewares/auth.middleware";
import checkParamIds from "../middlewares/objectId.middleware";
import uploader from "../middlewares/upload.middleware";

// * Controllers
import {
  createProduct,
  getAllProducts,
  getProduct,
  getProductStocks,
  getProductsHome,
  editProduct,
  editProductStocks,
  deleteProduct,
  changeProductStatus,
} from "../controllers/product.controller";

const router = Router();

router.route("/").post(adminProtect, uploader, createProduct);

router.route("/all").get(adminProtect, getAllProducts);
router.route("/home").get(getProductsHome);

router
  .route("/:id")
  .get(checkParamIds, getProduct)
  .put(adminProtect, checkParamIds, uploader, editProduct)
  .delete(adminProtect, checkParamIds, deleteProduct);

router
  .route("/:id/stocks")
  .get(adminProtect, checkParamIds, getProductStocks)
  .put(adminProtect, checkParamIds, editProductStocks);

router
  .route("/:id/status")
  .post(adminProtect, checkParamIds, changeProductStatus);

export default router;
