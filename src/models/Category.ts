import { Schema, model } from "mongoose";
import { ICategoryDocument } from "../@types/product.types";

const categorySchema: Schema = new Schema<ICategoryDocument>({
  name: {
    type: String,
    required: true,
  },
  showInMenu: {
    type: Boolean,
    default: true,
  },
});

const Category = model<ICategoryDocument>("Category", categorySchema);

export default Category;
