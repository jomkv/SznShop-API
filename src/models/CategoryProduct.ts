import mongoose, { Schema, model } from "mongoose";
import { ICategoryProduct } from "../@types/product.types";

const categoryProductSchema: Schema = new Schema<ICategoryProduct>({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
});

const CategoryProduct = model<ICategoryProduct>(
  "CategoryProduct",
  categoryProductSchema
);

export default CategoryProduct;
