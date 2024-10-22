import { Schema, model } from "mongoose";
import imageSchema from "./schemas/imageSchema";
import { IProduct } from "../@types/product.types";

const productSchema: Schema = new Schema<IProduct>({
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
  images: {
    type: [imageSchema],
    default: [],
  },
  active: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const Product = model<IProduct>("Product", productSchema);

export default Product;
