import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { IProductInput } from "../@types/product.types";
import mongoose from "mongoose";
import { uploadImages } from "../utils/cloudinaryHelper";

// * Models
import Product from "../models/Product";
import Stocks from "../models/Stocks";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";

// @desc Create Product
// @route POST /api/products
// @access Admin
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

    active = active ? active : true; // default to true if active not given
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
        .json({ message: "New Product Created", product: newProduct });
    } catch (error) {
      await session.abortTransaction();
      throw new DatabaseError();
    }
  }
);

// @desc Get Products
// @route POST /api/products
// @access Admin

export { createProduct };
