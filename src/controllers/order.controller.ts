import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { startSession } from "mongoose";
import {
  findAddressOrError,
  findOrderOrError,
  findProductOrError,
  findStocksOrError,
  findUserOrError,
} from "../utils/findOrError";
import { Types } from "mongoose";
import {
  IOrderDocument,
  IOrderProduct,
  IOrderProductDocument,
  IOrderProductInput,
} from "../@types/order.types";
import { IAddressDocument } from "../@types/address.types";
import { IStocksDocument } from "../@types/product.types";
import sendEmail from "../utils/nodemailer";
import { IUserDocument } from "../@types/user.types";

// * Models
import Order from "../models/Order";
import OrderProduct from "../models/OrderProduct";
import CartProduct from "../models/CartProduct";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";
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
    const order = req.order as IOrderDocument;

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
    const user: IUserDocument = await findUserOrError(
      req.sznUser?.userId as string
    );

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

      let orderTotal = 0;
      let orderItemsTableHtml = "";

      // Create order products
      const orderProducts: IOrderProduct[] = await Promise.all(
        rawProducts.map(async (op: IOrderProductInput) => {
          const prod = await findProductOrError(op.productId);

          if (prod.stocks[op.size] < op.quantity) {
            throw new BadRequestError("Not enough stocks");
          }

          orderTotal += op.quantity * prod.price;
          orderItemsTableHtml += `
            <tr>
              <td>
                <a href="${process.env.CLIENT_URL}/product/${prod._id}">
                  ${prod.name}
                </a>
              </td>
              <td>${op.quantity}</td>
              <td>₱${prod.price.toLocaleString()}</td>
              <td>₱${(prod.price * op.quantity).toLocaleString()}</td>
            </tr>
          `;

          const payload: IOrderProduct = {
            ...op,
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

      await sendEmail(
        process.env.ADMIN_EMAIL as string,
        `New Order Received: Order #${order._id}`,
        `
        <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>New Order Received</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .order-details {
                margin-bottom: 20px;
              }
              .order-details th, .order-details td {
                padding: 10px;
                border: 1px solid #ddd;
              }
              .order-details th {
                background-color: #f4f4f4;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Order Received</h1>
              </div>
              <p>Dear SZN Admin,</p>
              <p>A new order has been placed. Here are the details:</p>
              <div class="order-details">
                <table width="100%">
                  <tr>
                    <th>Order ID</th>
                    <td>${order._id}</td>
                  </tr>
                  <tr>
                    <th>Customer Name</th>
                    <td>${user.displayName}</td>
                  </tr>
                  <tr>
                    <th>Customer Email</th>
                    <td>${user.email}</td>
                  </tr>
                  <tr>
                    <th>Total Amount</th>
                    <td>₱${orderTotal.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>Order Date</th>
                    <td>${order.createdAt}</td>
                  </tr>
                </table>
              </div>
              <h2>Order Items</h2>
              <table width="100%" class="order-details">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsTableHtml}
                </tbody>
              </table>
            </div>
          </body>
          </html>
        `
      );

      await session.commitTransaction();

      res.status(201).json({ message: "Order created", order, orderProducts });
    } catch (error) {
      await session.abortTransaction();
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

      let total = 0;
      let tableHtml = "";

      for (const op of orderProducts) {
        const subtotal = op.price * op.quantity;
        total += subtotal;
        tableHtml += `
          <tr>
            <td><a href="${process.env.CLIENT_URL}/product/${op.productId._id}">${op.name}</a></td>
            <td>${op.quantity}</td>
            <td>₱${op.price}</td>
            <td>₱${subtotal}</td>
          </tr>
        `;

        const stock = stocks.find(
          (stock) => stock.productId.toString() === op.productId._id.toString()
        );

        if (stock) {
          stock[op.size] -= op.quantity;

          await stock.save({ session });
        }
      }

      await session.commitTransaction();

      await sendEmail(
        order.userId.email,
        `Your Order Has Been Accepted: Order #${order._id}`,
        `
          <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>Order Accepted</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                }
                .header {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .order-details {
                  margin-bottom: 20px;
                }
                .order-details th, .order-details td {
                  padding: 10px;
                  border: 1px solid #ddd;
                }
                .order-details th {
                  background-color: #f4f4f4;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Order Accepted</h1>
                </div>
                <p>Dear ${order.userId.displayName},</p>
                <p>We are pleased to inform you that your order has been accepted. Here are the details:</p>
                <div class="order-details">
                  <table width="100%">
                    <tr>
                      <th>Order ID</th>
                      <td>${order._id}</td>
                    </tr>
                    <tr>
                      <th>Total Amount</th>
                      <td>₱${total}</td>
                    </tr>
                  </table>
                </div>
                <h2>Order Items</h2>
                <table width="100%" class="order-details">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableHtml}
                  </tbody>
                </table>
                <p>Thank you for shopping with us!</p>
                <p>Best regards,</p>
                <p>The SZN Team</p>
              </div>
            </body>
            </html>
        `
      );

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

    const orderProducts: IOrderProductDocument[] = await OrderProduct.find({
      orderId: order._id,
    });

    const { total, tableHtml } = getOrderTableAndTotal(orderProducts);

    try {
      await order.save();

      await sendEmail(
        order.userId.email,
        `Your Order Has Been Rejected: Order #${order._id}`,
        `
        <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Order Rejected</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .order-details {
                margin-bottom: 20px;
              }
              .order-details th, .order-details td {
                padding: 10px;
                border: 1px solid #ddd;
              }
              .order-details th {
                background-color: #f4f4f4;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Order Rejected</h1>
              </div>
              <p>Dear ${order.userId.displayName},</p>
              <p>We regret to inform you that your order has been rejected. Here are the details:</p>
              <div class="order-details">
                <table width="100%">
                  <tr>
                    <th>Order ID</th>
                    <td>${order._id}</td>
                  </tr>
                  <tr>
                    <th>Total Amount</th>
                    <td>₱${total}</td>
                  </tr>
                </table>
              </div>
              <h2>Order Items</h2>
              <table width="100%" class="order-details">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableHtml}
                </tbody>
              </table>
              <p>We apologize for any inconvenience this may have caused. If you have any questions or need further assistance, please contact our support team.</p>
              <p>Best regards,</p>
              <p>The SZN Team</p>
            </div>
          </body>
          </html>
      `
      );

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

    const orderProducts = await OrderProduct.find({ orderId: order._id });

    const { total, tableHtml } = getOrderTableAndTotal(orderProducts);

    try {
      await order.save();

      await sendEmail(
        order.userId.email,
        `Your Order Has Been Received: Order #${order._id}`,
        `
        <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Order Rejected</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .order-details {
                margin-bottom: 20px;
              }
              .order-details th, .order-details td {
                padding: 10px;
                border: 1px solid #ddd;
              }
              .order-details th {
                background-color: #f4f4f4;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Order Received</h1>
              </div>
              <p>Dear ${order.userId.displayName},</p>
              <p>Your order has been received. Here are the details:</p>
              <div class="order-details">
                <table width="100%">
                  <tr>
                    <th>Order ID</th>
                    <td>${order._id}</td>
                  </tr>
                  <tr>
                    <th>Total Amount</th>
                    <td>₱${total}</td>
                  </tr>
                </table>
              </div>
              <h2>Order Items</h2>
              <table width="100%" class="order-details">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableHtml}
                </tbody>
              </table>
              <p>If you have any questions or need further assistance, please contact our support team.</p>
              <p>Best regards,</p>
              <p>The SZN Team</p>
            </div>
          </body>
          </html>
      `
      );

      res.status(200).json({ message: "Order received", order });
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

// @desc    Mark order as complete
// @route   PATCH /api/order/:id/complete
// @access  User
const completeOrder = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const order = req.order as IOrderDocument;

    order.status = "COMPLETED";
    order.timestamps.completedAt = new Date();

    const orderProducts = await OrderProduct.find({ orderId: order._id });

    const { total, tableHtml } = getOrderTableAndTotal(orderProducts);

    try {
      await order.save();

      res.status(200).json({ message: "Order completed", order });
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

// @desc    Cancel the order
// @route   PATCH /api/order/:id/cancel
// @access  User & Admin
const cancelOrder = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const order = req.order as IOrderDocument;

    order.status = "CANCELLED";
    order.timestamps.cancelledAt = new Date();

    const orderProducts = await OrderProduct.find({ orderId: order._id });

    const { total, tableHtml } = getOrderTableAndTotal(orderProducts);

    try {
      await order.save();

      // Send email to client
      await sendEmail(
        order.userId.email,
        `You Canceled Your Order : Order #${order._id}`,
        `
          <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>Order Canceled</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                }
                .header {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .order-details {
                  margin-bottom: 20px;
                }
                .order-details th, .order-details td {
                  padding: 10px;
                  border: 1px solid #ddd;
                }
                .order-details th {
                  background-color: #f4f4f4;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Order Canceled</h1>
                </div>
                <p>Dear ${order.userId.displayName},</p>
                <p>We regret to inform you that your order has been canceled. Here are the details:</p>
                <div class="order-details">
                  <table width="100%">
                    <tr>
                      <th>Order ID</th>
                      <td>${order._id}</td>
                    </tr>
                    <tr>
                      <th>Total Amount</th>
                      <td>₱${total}</td>
                    </tr>
                  </table>
                </div>
                <h2>Order Items</h2>
                <table width="100%" class="order-details">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableHtml}
                  </tbody>
                </table>
                <p>If you have any questions or need further assistance, please contact our support team.</p>
                <p>Best regards,</p>
                <p>The SZN Team</p>
              </div>
            </body>
            </html>
        `
      );

      // Send email to admin
      await sendEmail(
        order.userId.email,
        `Order Canceled: Order #${order._id}`,
        `
          <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>Order Canceled</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                }
                .header {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .order-details {
                  margin-bottom: 20px;
                }
                .order-details th, .order-details td {
                  padding: 10px;
                  border: 1px solid #ddd;
                }
                .order-details th {
                  background-color: #f4f4f4;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Order Canceled</h1>
                </div>
                <p>Dear ${order.userId.displayName},</p>
                <p>We regret to inform you that a customer order has canceled their order. Here are the details:</p>
                <div class="order-details">
                  <table width="100%">
                    <tr>
                      <th>Order ID</th>
                      <td>${order._id}</td>
                    </tr>
                    <tr>
                      <th>Total Amount</th>
                      <td>₱${total}</td>
                    </tr>
                  </table>
                </div>
                <h2>Order Items</h2>
                <table width="100%" class="order-details">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableHtml}
                  </tbody>
                </table>
                <p>Best regards,</p>
                <p>The SZN Team</p>
              </div>
            </body>
            </html>
        `
      );

      res.status(200).json({ message: "Order cancelled", order });
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

// @desc    Mark order as returned
// @route   PATCH /api/order/:id/return
// @access  Admin
const returnOrder = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const order = await findOrderOrError(req.params.id);

    // order.status = "RETURN";
    // order.timestamps.returnedAt = new Date();

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

    const session = await startSession();
    session.startTransaction();

    try {
      await order.save({ session });

      const { total, tableHtml } = getOrderTableAndTotal(orderProducts);

      // Replenish stocks
      for (const op of orderProducts) {
        const stock = stocks.find(
          (stock) => stock.productId.toString() === op.productId._id.toString()
        );

        if (stock) {
          // Give back stocks
          stock[op.size] += op.quantity;

          await stock.save({ session });
        }
      }

      await session.commitTransaction();

      await sendEmail(
        order.userId.email,
        `Your Order Has Been Returned: Order #${order._id}`,
        `
          <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>Order Returned</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                }
                .header {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .order-details {
                  margin-bottom: 20px;
                }
                .order-details th, .order-details td {
                  padding: 10px;
                  border: 1px solid #ddd;
                }
                .order-details th {
                  background-color: #f4f4f4;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Order Returned</h1>
                </div>
                <p>Dear ${order.userId.displayName},</p>
                <p>We regret to inform you that your order has been marked as returned. Here are the details:</p>
                <div class="order-details">
                  <table width="100%">
                    <tr>
                      <th>Order ID</th>
                      <td>${order._id}</td>
                    </tr>
                    <tr>
                      <th>Total Amount</th>
                      <td>₱${total}</td>
                    </tr>
                  </table>
                </div>
                <h2>Order Items</h2>
                <table width="100%" class="order-details">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableHtml}
                  </tbody>
                </table>
                <p>We apologize for any inconvenience this may have caused. If you have any questions or need further assistance, please contact our support team.</p>
                <p>Best regards,</p>
                <p>The SZN Team</p>
              </div>
            </body>
            </html>
        `
      );

      res.status(200).json({ message: "Order returned", order });
    } catch (error) {
      await session.abortTransaction();
      throw new DatabaseError();
    }
  }
);

const getOrderTableAndTotal = (
  orderProducts: IOrderProductDocument[]
): { total: number; tableHtml: string } => {
  let total = 0;
  let tableHtml = "";

  for (const op of orderProducts) {
    const subtotal = op.price * op.quantity;
    total += subtotal;
    tableHtml += `
        <tr>
          <td><a href="${process.env.CLIENT_URL}/product/${op.productId._id}">${op.name}</a></td>
          <td>${op.quantity}</td>
          <td>₱${op.price}</td>
          <td>₱${subtotal}</td>
        </tr>
      `;
  }

  return { total, tableHtml };
};

export {
  getMyOrders,
  getAllOrders,
  getOrder,
  createOrder,
  cancelOrder,
  acceptOrder,
  rejectOrder,
  receivedOrder,
  completeOrder,
  returnOrder,
};
