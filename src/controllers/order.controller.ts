import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { startSession } from "mongoose";
import {
  findAddressOrError,
  findOrderOrError,
  findProductOrError,
  findStocksOrError,
} from "../utils/findOrError";
import { Types } from "mongoose";
import {
  IOrderProduct,
  IOrderProductDocument,
  IOrderProductInput,
} from "../@types/order.types";
import { IAddressDocument } from "../@types/address.types";

// * Models
import Order from "../models/Order";
import OrderProduct from "../models/OrderProduct";
import CartProduct from "../models/CartProduct";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";
import { IStocksDocument } from "../@types/product.types";
import AuthenticationError from "../errors/AuthenticationError";

// @desc    Get my Orders
// @route   GET /api/order
// @access  User
const getMyOrders = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const orders = await Order.find({ userId: req.sznUser?.userId });
    const reviewing = orders.filter((order) => order.status === "REVIEWING");
    const shipping = orders.filter((order) => order.status === "SHIPPING");
    const received = orders.filter((order) => order.status === "RECEIVED");
    const completed = orders.filter((order) => order.status === "COMPLETED");
    const cancelled = orders.filter((order) => order.status === "CANCELLED");
    const returned = orders.filter((order) => order.status === "RETURN");
    const refunded = orders.filter((order) => order.status === "REFUND");

    res.status(200).json({
      message: "Orders successfully fetched",
      all: orders,
      reviewing,
      shipping,
      received,
      completed,
      cancelled,
      returned,
      refunded,
    });
  }
);

// @desc    Get Specific Orders
// @route   GET /api/order/:id
// @access  User & Admin
const getOrder = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const order = await findOrderOrError(req.params.id);

    if (
      order.userId.toString() !== req.sznUser?.userId &&
      req.sznUser?.role !== "admin"
    ) {
      throw new AuthenticationError();
    }

    res.status(200).json({
      message: "Orders successfully fetched.",
      order,
    });
  }
);

// @desc    Get All Orders
// @route   GET /api/order/all
// @access  Admin
const getAllOrders = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const orders = await Order.find();
    const reviewing = orders.filter((order) => order.status === "REVIEWING");
    const shipping = orders.filter((order) => order.status === "SHIPPING");
    const received = orders.filter((order) => order.status === "RECEIVED");
    const completed = orders.filter((order) => order.status === "COMPLETED");
    const cancelled = orders.filter((order) => order.status === "CANCELLED");
    const returned = orders.filter((order) => order.status === "RETURN");
    const refunded = orders.filter((order) => order.status === "REFUND");

    res.status(200).json({
      message: "Orders successfully fetched.",
      all: orders,
      reviewing,
      shipping,
      received,
      completed,
      cancelled,
      returned,
      refunded,
    });
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
      const shippingFee = address.province === "Cavite" ? 50 : 100;

      const order = new Order({
        address,
        userId: req.sznUser?.userId,
        shippingFee,
      });
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

// @desc    Accept the order
// @route   PATCH /api/order/:id/accept
// @access  Admin
const acceptOrder = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const order = await findOrderOrError(req.params.id);

    order.status = "SHIPPING";
    order.timestamps.shippedAt = new Date();

    const session = await startSession();
    session.startTransaction();

    const orderProducts: IOrderProductDocument[] = await OrderProduct.find({
      orderId: order._id,
    });

    const stocks: IStocksDocument[] = await Promise.all(
      orderProducts.map(async (op) => {
        const stock: IStocksDocument = await findStocksOrError(
          op.productId as unknown as string
        );

        return stock;
      })
    );

    try {
      await order.save({ session });

      for (const op of orderProducts) {
        const stock = stocks.find(
          (stock) => stock.productId.toString() === op.productId.toString()
        );

        if (stock) {
          stock[op.size] -= op.quantity;

          await stock.save({ session });
        }
      }

      await session.commitTransaction();

      res.status(200).json({ message: "Order accepted", order });
    } catch (error) {
      await session.abortTransaction();
      throw new DatabaseError();
    }
  }
);

// @desc    Reject the order
// @route   PATCH /api/order/:id/reject
// @access  Admin
const rejectOrder = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const order = await findOrderOrError(req.params.id);

    order.status = "CANCELLED";
    order.timestamps.cancelledAt = new Date();

    try {
      await order.save();

      res.status(200).json({ message: "Order reject", order });
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

// @desc    Mark order as received
// @route   PATCH /api/order/:id/received
// @access  Admin
const receivedOrder = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const order = await findOrderOrError(req.params.id);

    order.status = "RECEIVED";
    order.timestamps.receivedAt = new Date();

    try {
      await order.save();

      res.status(200).json({ message: "Order received", order });
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

export {
  getMyOrders,
  getAllOrders,
  getOrder,
  createOrder,
  cancelOrder,
  acceptOrder,
  rejectOrder,
  receivedOrder,
};
