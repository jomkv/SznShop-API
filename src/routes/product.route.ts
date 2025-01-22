import { Router } from "express";

// * Middlewares
import { adminProtect, protect } from "../middlewares/auth.middleware";
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
  getProductBuyNow,
  getProductsCartCheckout,
  getProductsCategory,
} from "../controllers/product.controller";

const router = Router();

router
  .route("/")
  .get(getProductsCategory)
  .post(adminProtect, uploader(4), createProduct);

router.route("/all").get(adminProtect, getAllProducts);
router.route("/home").get(getProductsHome);
router.route("/checkout/cart").get(protect, getProductsCartCheckout);
router.route("/checkout/:id").get(protect, checkParamIds, getProductBuyNow);

router
  .route("/:id")
  .get(checkParamIds, getProduct)
  .put(adminProtect, checkParamIds, uploader(4), editProduct)
  .delete(adminProtect, checkParamIds, deleteProduct);

router
  .route("/:id/stocks")
  .get(adminProtect, checkParamIds, getProductStocks)
  .put(adminProtect, checkParamIds, editProductStocks);

router
  .route("/:id/status")
  .post(adminProtect, checkParamIds, changeProductStatus);

export default router;
