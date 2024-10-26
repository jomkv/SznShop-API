import mongoose, { Schema, model } from "mongoose";
import { ICategoryProductDocument } from "../@types/product.types";

const categoryProductSchema: Schema = new Schema<ICategoryProductDocument>({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
});

const CategoryProduct = model<ICategoryProductDocument>(
  "CategoryProduct",
  categoryProductSchema
);

export default CategoryProduct;
