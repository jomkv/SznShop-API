import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { IProductDocument, Size } from "../@types/product.types";
import { findProductOrError } from "../utils/findOrError";

// * Models
import User from "../models/User";
import CartProduct from "../models/CartProduct";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import AuthenticationError from "../errors/AuthenticationError";
import DatabaseError from "../errors/DatabaseError";

const allowedSizes: Size[] = ["xs", "sm", "md", "lg", "xl"];

// @desc    Add product to cart
// @route   POST /api/cart/:id
// @access  Private
const addToCart = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const product: IProductDocument = await findProductOrError(req.params.id);
    const quantity: number = Number(req.body.quantity) || 1;
    const size: Size = req.body.size;

    if (!allowedSizes.includes(size)) {
      throw new BadRequestError("Invalid size");
    }

    let cartProduct = await CartProduct.findOne({
      userId: req.sznUser?.userId,
      productId: product._id,
      size: size,
    });

    if (cartProduct && cartProduct.quantity + quantity > product.stocks[size]) {
      throw new BadRequestError("Not enough stocks");
    } else if (quantity > product.stocks[size]) {
      throw new BadRequestError("Not enough stocks");
    }

    if (cartProduct) {
      cartProduct.quantity += quantity;
    } else {
      cartProduct = new CartProduct({
        userId: req.sznUser?.userId,
        productId: product._id,
        quantity,
        size,
      });
    }

    try {
      await cartProduct.save();
      res.status(201).json({ message: "Product added to cart", cartProduct });
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

// @desc    Get all cart products
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const cartProducts = await CartProduct.find({
      userId: req.sznUser?.userId,
    }).populate("productId");

    res.status(200).json({ message: "Cart fetched", cartProducts });
  }
);

export { addToCart, getCart };
