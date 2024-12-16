import mongoose, { Schema, model } from "mongoose";
import { IOrderProductDocument } from "../@types/order.types";

const orderProductSchema: Schema = new Schema<IOrderProductDocument>(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

orderProductSchema.pre(["find", "findOne"], function (next) {
  this.populate({ path: "productId", select: "name description price images" });
  next();
});

const OrderProduct = model<IOrderProductDocument>(
  "OrderProduct",
  orderProductSchema
);

export default OrderProduct;
