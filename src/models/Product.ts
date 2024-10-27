import { Schema, model } from "mongoose";
import imageSchema from "./schemas/image.schema";
import { IProductDocument } from "../@types/product.types";
import { softDeletePlugin } from "./plugins/softDelete.plugin";

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
});

softDeletePlugin(productSchema);

const Product = model<IProductDocument>("Product", productSchema);

export default Product;
