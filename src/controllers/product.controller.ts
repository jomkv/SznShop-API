import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import {
  IProductDocument,
  IProductInput,
  IStocksInput,
} from "../@types/product.types";
import mongoose from "mongoose";
import { deleteImages, uploadImages } from "../utils/cloudinaryHelper";
import { findProductOrError, findStocksOrError } from "../utils/findOrError";

// * Models
import Product from "../models/Product";
import Stocks from "../models/Stocks";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";

// @desc    Create Product
// @route   POST /api/product
// @access  Admin
const createProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    let { name, description, price, active }: IProductInput = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    if (!name || !description || !price) {
      throw new BadRequestError("Incomplete input");
    }

    if (!files || files.length === 0) {
      throw new BadRequestError("No image(s) uploaded");
    }

    active = typeof active !== "undefined" ? active : true; // default to true if active not given
    const images = await uploadImages(files);

    const newProduct = new Product({
      name,
      description,
      price,
      active,
      images,
    });

    const newStocks = new Stocks({
      productId: newProduct._id,
    });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await newProduct.save({ session });
      await newStocks.save({ session });

      await session.commitTransaction();

      res
        .status(201)
        .json({ message: "New product created", product: newProduct });
    } catch (error) {
      await session.abortTransaction();
      throw new DatabaseError();
    }
  }
);

// @desc    Edit existing product
// @route   PUT /api/product/:id
// @access  Admin
const editProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const product = await findProductOrError(req.params.id);
    let { name, description, price, active }: IProductInput = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    active = active ? active : true; // default to true if active not given

    // If new images uploaded, replace existing images
    let images = product.images;
    if (files && files.length > 0) {
      images = await uploadImages(files);
      await deleteImages(product.images);
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.active = active;
    product.images = images;

    try {
      await product.save();

      res.status(200).json({ message: "Product updated", product });
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

// @desc    Edit product's stocks
// @route   PUT /api/product/:id/stocks
// @access  Admin
const editProductStocks = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const stocks = await findStocksOrError(req.params.id);
    const { xs, sm, md, lg, xl }: IStocksInput = req.body;

    // If new images uploaded, replace existing images
    stocks.xs = xs;
    stocks.sm = sm;
    stocks.md = md;
    stocks.lg = lg;
    stocks.xl = xl;

    try {
      await stocks.save();

      res.status(200).json({ message: "Product stocks updated", stocks });
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

// @desc    Soft delete a product (not restoreable)
// @route   DELETE /api/product/:id
// @access  Admin
const deleteProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const product = await findProductOrError(req.params.id);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const productImages = product.images;

      await product.deleteOne({ session });
      await Stocks.deleteOne({ productId: product._id }, { session });
      await session.commitTransaction();

      await deleteImages(productImages);

      res.status(200).json({ message: "Product deleted", product });
    } catch (error) {
      await session.abortTransaction();
      throw new DatabaseError();
    }
  }
);

// @desc    Inverts product status from inactive to active and vice versa
// @route   POST /api/product/:id/status
// @access  Admin
const changeProductStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const product = await findProductOrError(req.params.id);

    product.active = !product.active;

    try {
      await product.save();

      res.status(200).json({ message: "Product status changed", product });
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

// @desc    Get Products Stocks
// @route   GET /api/product/:id/stocks
// @access  Admin
const getProductStocks = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const stocks = await findStocksOrError(req.params.id);

    res.status(200).json({ message: "Product stocks fetched", stocks });
  }
);

// @desc    Get all products for admin products page
// @route   GET /api/product/all
// @access  Admin
const getAllProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const filter = req.query.filter as string | undefined;

    let result: { active?: IProductDocument[]; inactive?: IProductDocument[] } =
      {};

    if (filter === "active") {
      result.active = await Product.find({ active: true });
    } else if (filter === "inactive") {
      result.inactive = await Product.find({ active: false });
    } else {
      result.active = await Product.find({ active: true });
      result.inactive = await Product.find({ active: false });
    }

    res.status(200).json({
      message: "All products fetched",
      ...result,
    });
  }
);

// @desc    Get Products for Home page
// @route   GET /api/product/home
// @access  User & Admin
const getProductsHome = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const products = await Product.find({ active: true });

    res.status(200).json({ message: "Home products fetched", products });
  }
);

// @desc    Get specific product
// @route   GET /api/product/:id
// @access  User & Admin
const getProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const product = await findProductOrError(req.params.id);

    res.status(200).json({ message: "Specific product fetched", product });
  }
);

export {
  createProduct,
  getAllProducts,
  getProductsHome,
  getProduct,
  getProductStocks,
  editProduct,
  editProductStocks,
  deleteProduct,
  changeProductStatus,
};
