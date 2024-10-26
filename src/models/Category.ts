import { Schema, model } from "mongoose";
import { ICategory } from "../@types/product.types";

const categorySchema: Schema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
  },
  showInMenu: {
    type: Boolean,
    default: true,
  },
});

const Category = model<ICategory>("Category", categorySchema);

export default Category;
