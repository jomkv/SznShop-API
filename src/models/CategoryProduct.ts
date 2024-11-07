import mongoose, { Schema, model } from "mongoose";
import { ICategoryProductDocument } from "../@types/product.types";

const categoryProductSchema: Schema = new Schema<ICategoryProductDocument>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  { toJSON: { virtuals: true } }
);

// virtual property where product will be populated to
categoryProductSchema.virtual("product", {
  ref: "Product",
  localField: "productId",
  foreignField: "_id",
  justOne: true,
});

// pre hook to populate
categoryProductSchema.pre(["find", "findOne"], function (next) {
  if (!this.getOptions().excludeProduct) {
    this.populate({ path: "product" });
  }

  next();
});

const CategoryProduct = model<ICategoryProductDocument>(
  "CategoryProduct",
  categoryProductSchema
);

export default CategoryProduct;
