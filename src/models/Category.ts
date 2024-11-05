import { Schema, model } from "mongoose";
import { ICategoryDocument } from "../@types/product.types";

const categorySchema: Schema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    showInMenu: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

categorySchema.virtual("productCount", {
  ref: "CategoryProduct",
  localField: "_id",
  foreignField: "categoryId",
  count: true,
});

// pre hook to populate
categorySchema.pre(["find", "findOne"], function (next) {
  this.populate({ path: "productCount" });
  next();
});

const Category = model<ICategoryDocument>("Category", categorySchema);

export default Category;
