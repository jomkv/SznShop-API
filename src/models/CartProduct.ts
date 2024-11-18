import mongoose, { Schema, model } from "mongoose";
import { ICartProduct } from "../@types/cart.types";

const cartProductSchema: Schema = new Schema<ICartProduct>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    size: {
      type: String,
      enum: ["xs", "sm", "md", "lg", "xl"],
      required: true,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

const CartProduct = model<ICartProduct>("CartProduct", cartProductSchema);

export default CartProduct;
