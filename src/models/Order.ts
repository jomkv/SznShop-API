import mongoose, { Schema, Types, model } from "mongoose";
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shippingFee: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

orderSchema.virtual("orderProducts", {
  ref: "OrderProduct",
  localField: "_id",
  foreignField: "orderId",
});

// pre hook to populate
orderSchema.pre(["find", "findOne"], function (next) {
  this.populate({ path: "orderProducts" });
  this.populate({ path: "userId", select: "firstName lastName" });
  next();
});

const Order = model<IOrderDocument>("Order", orderSchema);

export default Order;
