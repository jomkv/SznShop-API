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
import { IImage } from "../@types/image.types";

// * Models
import Product from "../models/Product";
import Stocks from "../models/Stocks";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";
import CategoryProduct from "../models/CategoryProduct";

// @desc    Get my Orders
// @route   GET /api/order
// @access  User
const getMyOrders = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    // TODO
  }
);

// @desc    Get All Orders
// @route   GET /api/order/all
// @access  Admin
const getAllOrders = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    // TODO
  }
);

// @desc    Create Order
// @route   POST /api/order
// @access  User
const createOrder = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    // TODO
  }
);

// @desc    Cancel the order
// @route   POST /api/order/:id/cancel
// @access  User & Admin
const cancelOrder = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    // TODO
  }
);

export { getMyOrders, getAllOrders, createOrder, cancelOrder };
