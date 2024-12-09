import { Schema, model } from "mongoose";
import { IOrderDocument } from "../@types/order.types";

const orderSchema: Schema = new Schema<IOrderDocument>(
  {
    address: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      region: {
        type: String,
        required: true,
      },
      province: {
        type: String,
        required: true,
      },
      municipality: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      addressLabel: {
        type: String,
        required: true,
      },
      phoneNumber: {
        type: String,
        required: true,
      },
    },
    timestamps: {
      reviewedAt: {
        type: Date,
      },
      shippedAt: {
        type: Date,
      },
      receivedAt: {
        type: Date,
      },
      completedAt: {
        type: Date,
      },
      cancelledAt: {
        type: Date,
      },
      returnedAt: {
        type: Date,
      },
      refundedAt: {
        type: Date,
      },
    },
    status: {
      type: String,
      required: true,
      default: "REVIEWING",
    },
  },
  { timestamps: true }
);

const Order = model<IOrderDocument>("Order", orderSchema);

export default Order;
