import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import {
  ICategoryDocument,
  ICategoryInput,
  ICategoryProductDocument,
} from "../@types/product.types";
import { findCategoryOrError } from "../utils/findOrError";
import { startSession } from "mongoose";

// * Models
import Category from "../models/Category";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";
import CategoryProduct from "../models/CategoryProduct";

// @desc    Create a new product category
// @route   POST /api/category
// @access  Admin
const createCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    let { name, showInMenu, description, productIds }: ICategoryInput =
      req.body;

    if (!name) {
      throw new BadRequestError("Incomplete input");
    }

    const isNameTaken = await Category.findOne({ name });

    if (isNameTaken) {
      throw new BadRequestError("Category name already taken");
    }

    showInMenu = typeof showInMenu !== "undefined" ? showInMenu : false; // default to false if showInMenu not given

    const session = await startSession();
    session.startTransaction();

    try {
      const category = new Category({ name, description, showInMenu });

      if (productIds) {
        const cps =
          productIds?.map((cp) => ({
            productId: cp,
            categoryId: category._id,
          })) || [];
        await CategoryProduct.insertMany(cps, { session });
      }

      await category.save({ session });

      await session.commitTransaction();

      res.status(201).json({ message: "Category created", category });
    } catch (error) {
      await session.abortTransaction();
      throw new DatabaseError();
    }
  }
);

// @desc    Get all product categories
// @route   GET /api/category
// @access  Admin
const getAllCategories = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const categories = await Category.find();

    res.status(200).json({
      message: "Categories fetched",
      categories,
    });
  }
);

// @desc Get categories with products for home page
// @route GET /api/category/home
// @access User & Admin
const getCategoriesHome = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const categories = await Category.find({ showInMenu: true });
    const categoryWithProducts = await Promise.all(
      categories.map(async (category: ICategoryDocument) => ({
        category: category,
        products: (
          await CategoryProduct.find({
            categoryId: category._id,
          })
        ).map((cp: ICategoryProductDocument) => cp.product),
      }))
    );

    res.status(200).json({
      message: "Categories with products fetched",
      categories,
      categoryWithProducts,
    });
  }
);

// @desc    Get category's products
// @route   GET /api/category/:id
// @access  User & Admin
const getCategoryProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const category = await findCategoryOrError(req.params.id);
    const categoryProducts = await CategoryProduct.find({
      categoryId: category._id,
    }).setOptions({ excludeProduct: false });
    const productIds = categoryProducts.map((cp) => cp.productId);

    res.status(200).json({
      message: "Category products fetched",
      category,
      categoryProducts,
      productIds,
    });
  }
);

// @desc    Add/Remove a product to a category
// @route   POST /api/category/:categoryId/:productId
// @access  Admin
const addRemoveCategoryProduct = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const category = await findCategoryOrError(req.params.categoryId);

    let categoryProduct = await CategoryProduct.findOne({
      categoryId: category._id,
      productId: req.params.productId,
    });

    try {
      if (categoryProduct) {
        await categoryProduct.deleteOne();

        return res.status(200).json({
          message: "Product removed from category",
        });
      } else {
        const newCategoryProduct = new CategoryProduct({
          productId: req.params.productId,
          categoryId: category._id,
        });

        await newCategoryProduct.save();

        res.status(201).json({
          message: "Product added to category",
        });
      }
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

// @desc    Show/Hide Category
// @route   POST /api/category/show/:id
// @access  Admin
const showHideCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await findCategoryOrError(req.params.id);

  category.showInMenu = !category.showInMenu;

  await category.save();

  res.status(200).json({
    message: "Category updated",
    category,
  });
});

// @desc    Update category productS
// @route   PUT /api/category/:categoryId
// @access  Admin
const editCategory = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const category = await findCategoryOrError(req.params.id);

    const newProductIds: string[] | undefined = req.body.productIds;
    let newCategoryName: string | undefined = req.body.name;
    let showInMenu: boolean | undefined = req.body.showInMenu;

    if (!newProductIds) {
      throw new BadRequestError("Incomplete input");
    }

    if (!newCategoryName) {
      newCategoryName = category.name;
    }

    if (!showInMenu) {
      showInMenu = category.showInMenu;
    }

    const existingCps: string[] =
      (
        await CategoryProduct.find({
          categoryId: category._id,
        }).setOptions({ excludeProduct: true })
      ).map((cp) => cp.productId.toString()) || [];

    const removedCps: string[] = existingCps.filter(
      (ecp) => !newProductIds.includes(ecp as string)
    );

    const addedCps: string[] = newProductIds.filter(
      (ncp) => !existingCps.includes(ncp as string)
    );

    // existing - removed + added
    const cpCount = existingCps.length - removedCps.length + addedCps.length;

    category.name = newCategoryName;
    category.showInMenu = cpCount < 4 ? false : showInMenu;

    const session = await startSession();
    session.startTransaction();

    try {
      // remove cps
      if (removedCps.length > 0) {
        await CategoryProduct.deleteMany(
          {
            categoryId: category._id,
            productId: { $in: removedCps },
          },
          { session }
        );
      }

      // add cps
      if (addedCps.length > 0) {
        const newCategoryProducts = addedCps.map((cp) => ({
          productId: cp,
          categoryId: category._id,
        }));

        await CategoryProduct.insertMany(newCategoryProducts, { session });
      }

      await category.save({ session });

      await session.commitTransaction();

      res.status(200).json({
        message: "Category products updated",
      });
    } catch (error) {
      await session.abortTransaction();
      throw new DatabaseError();
    }
  }
);

// @desc   Delete a category
// @route  DELETE /api/category/:id
// @access Admin
const deleteCategory = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const category = await findCategoryOrError(req.params.id);

    const session = await startSession();
    session.startTransaction();

    try {
      await category.deleteOne({ session });
      await CategoryProduct.deleteMany(
        { categoryId: category._id },
        { session }
      );

      await session.commitTransaction();

      res.status(200).json({ message: "Category deleted" });
    } catch (error) {
      await session.abortTransaction();
      throw new DatabaseError();
    }
  }
);

export {
  createCategory,
  getAllCategories,
  getCategoryProducts,
  getCategoriesHome,
  addRemoveCategoryProduct,
  showHideCategory,
  editCategory,
  deleteCategory,
};
