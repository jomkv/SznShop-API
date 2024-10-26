import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Product from "../models/Product";
import Stocks from "../models/Stocks";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import AuthenticationError from "../errors/AuthenticationError";
import DatabaseError from "../errors/DatabaseError";

// @desc Create Product
// @route POST /api/products
// @access Admin
const createProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ message: "Create Product" });
  }
);

export { createProduct };
