import { Schema, model } from "mongoose";
import imageSchema from "./schemas/imageSchema";
import { IProductDocument } from "../@types/product.types";

const productSchema: Schema = new Schema<IProductDocument>({
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

const Product = model<IProductDocument>("Product", productSchema);

export default Product;
