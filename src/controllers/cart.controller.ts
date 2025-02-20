import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { IProductDocument, Size, allowedSizes } from "../@types/product.types";
import { findCartItemOrError, findProductOrError } from "../utils/findOrError";

// * Models
import CartProduct from "../models/CartProduct";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import AuthenticationError from "../errors/AuthenticationError";
import DatabaseError from "../errors/DatabaseError";

// @desc    Add product to cart, or update quantity
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

    if (!cartProduct && quantity <= 0) {
      throw new BadRequestError("Invalid quantity");
    }

    if (cartProduct) {
      const totalQuantity = cartProduct.quantity + quantity;

      if (totalQuantity > product.stocks[size]) {
        throw new BadRequestError("Not enough stocks");
      } else if (totalQuantity <= 0) {
        try {
          await cartProduct.deleteOne();
          return res.status(200).json({ message: "Product removed from cart" });
        } catch (error) {
          throw new DatabaseError();
        }
      }
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

// @desc    Increment cart item quantity
// @route   POST /api/cart/:id/increment
// @access  Private
const incrementCartItem = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const cartItem = await findCartItemOrError(req.params.id);

    if (cartItem.userId.toString() !== req.sznUser?.userId) {
      throw new AuthenticationError();
    }

    const product = await findProductOrError(String(cartItem.productId._id));

    if (cartItem.quantity + 1 > product.stocks[cartItem.size]) {
      throw new BadRequestError("Not enough stocks");
    }

    try {
      cartItem.quantity += 1;
      await cartItem.save();
      res
        .status(200)
        .json({ message: "Cart item quantity incremented", cartItem });
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

// @desc    Decrement cart item quantity
// @route   POST /api/cart/:id/decrement
// @access  Private
const decrementCartItem = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const cartItem = await findCartItemOrError(req.params.id);

    if (cartItem.userId.toString() !== req.sznUser?.userId) {
      throw new AuthenticationError();
    }

    if (cartItem.quantity - 1 < 0) {
      throw new BadRequestError("Unable to decrement quantity");
    }

    try {
      if (cartItem.quantity - 1 === 0) {
        await cartItem.deleteOne();
        return res.status(200).json({ message: "Cart item removed" });
      } else {
        cartItem.quantity -= 1;
        await cartItem.save();
        res
          .status(200)
          .json({ message: "Cart item quantity incremented", cartItem });
      }
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

// @desc    Remove a cart item
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const cartItem = await findCartItemOrError(req.params.id);

    if (cartItem.userId.toString() !== req.sznUser?.userId) {
      throw new AuthenticationError();
    }

    try {
      await cartItem.deleteOne();
      return res.status(200).json({ message: "Cart item removed" });
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

export {
  addToCart,
  getCart,
  removeFromCart,
  incrementCartItem,
  decrementCartItem,
};
