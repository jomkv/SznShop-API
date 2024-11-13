import { Router } from "express";

// * Middlewares
import { adminProtect } from "../middlewares/auth.middleware";
import checkParamIds from "../middlewares/objectId.middleware";

// * Controllers
import {
  createCategory,
  getCategoryProducts,
  getAllCategories,
  addRemoveCategoryProduct,
  showHideCategory,
  editCategory,
  deleteCategory,
} from "../controllers/category.controller";

const router = Router();

router
  .route("/")
  .get(adminProtect, getAllCategories)
  .post(adminProtect, createCategory);

router
  .route("/:id")
  .get(checkParamIds, getCategoryProducts)
  .put(adminProtect, checkParamIds, editCategory)
  .delete(adminProtect, checkParamIds, deleteCategory);

router.route("/show/:id").post(adminProtect, checkParamIds, showHideCategory);

router
  .route("/:categoryId/:productId")
  .post(adminProtect, checkParamIds, addRemoveCategoryProduct);

export default router;
