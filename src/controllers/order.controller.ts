import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { startSession } from "mongoose";
import { findAddressOrError, findProductOrError } from "../utils/findOrError";
import { Types } from "mongoose";
import { IOrderProduct, IOrderProductInput } from "../@types/order.types";
import { IAddressDocument } from "../@types/address.types";

// * Models
import Order from "../models/Order";
import OrderProduct from "../models/OrderProduct";
import CartProduct from "../models/CartProduct";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";

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
    const orders = await Order.find();

    res.status(200).json({ message: "Orders successfully fetched.", orders });
  }
);

// @desc    Create Order
// @route   POST /api/order
// @access  User
const createOrder = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const rawProducts: IOrderProductInput[] = req.body.products;
    const addressId: string = req.body.address;
    const isCart: boolean = Boolean(req.body.isCart);

    const address: IAddressDocument = await findAddressOrError(addressId);

    const session = await startSession();
    session.startTransaction();

    try {
      // Create order
      const order = new Order({ address, userId: req.sznUser?.userId });
      await order.save({ session });

      // Create order products
      const orderProducts: IOrderProduct[] = await Promise.all(
        rawProducts.map(async (product: IOrderProductInput) => {
          const prod = await findProductOrError(product.productId);

          if (prod.stocks[product.size] < product.quantity) {
            throw new BadRequestError("Not enough stocks");
          }

          const payload: IOrderProduct = {
            ...product,
            productId: prod._id as unknown as Types.ObjectId,
            orderId: order._id as Types.ObjectId,
            name: prod.name,
            description: prod.description,
            price: prod.price,
          };

          return payload;
        })
      );

      // Delete cart items if order is from cart
      if (isCart) {
        await CartProduct.deleteMany(
          { userId: req.sznUser?.userId },
          { session }
        );
      }

      await OrderProduct.insertMany(orderProducts, { session });
      await session.commitTransaction();

      res.status(201).json({ message: "Order created", order, orderProducts });
    } catch (error) {
      throw new DatabaseError();
    }
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
