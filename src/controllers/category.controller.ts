import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { ICategoryInput } from "../@types/product.types";
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
    let { name, showInMenu }: ICategoryInput = req.body;

    if (!name) {
      throw new BadRequestError("Incomplete input");
    }

    const isNameTaken = await Category.findOne({ name });

    if (isNameTaken) {
      throw new BadRequestError("Category name already taken");
    }

    showInMenu = typeof showInMenu !== "undefined" ? showInMenu : false; // default to false if showInMenu not given

    const category = await Category.create({ name, showInMenu });

    res.status(201).json({ message: "Category created", category });
  }
);

// @desc    Get all product categories
// @route   GET /api/category
// @access  Admin
const getAllCategories = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const categories = await Category.find();

    res.status(200).json({ message: "Categories fetched", categories });
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
    }).setOptions({ excludeProduct: true });
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

// @desc    Update category productS
// @route   PUT /api/category/:categoryId
// @access  Admin
const editCategoryProducts = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const category = await findCategoryOrError(req.params.id);

    const newProductIds: string[] | undefined = req.body.productIds;

    if (!newProductIds) {
      throw new BadRequestError("Incomplete input");
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

    // if no changes made
    if (removedCps.length <= 0 && addedCps.length <= 0) {
      return res.status(200).json({
        message: "No changes made",
      });
    }

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

export {
  createCategory,
  getAllCategories,
  getCategoryProducts,
  addRemoveCategoryProduct,
  editCategoryProducts,
};
