import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { ICategoryInput } from "../@types/product.types";
import { findCategoryOrError } from "../utils/findOrError";

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
    const products = await CategoryProduct.find({ categoryId: category._id });

    res
      .status(200)
      .json({ message: "Category products fetched", category, products });
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

export {
  createCategory,
  getAllCategories,
  getCategoryProducts,
  addRemoveCategoryProduct,
};
