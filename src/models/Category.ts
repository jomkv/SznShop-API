import { Schema, model } from "mongoose";
import { ICategoryDocument } from "../@types/product.types";

const categorySchema: Schema = new Schema<ICategoryDocument>({
  name: {
    type: String,
    required: true,
  },
  showInMenu: {
    type: Boolean,
    default: false,
  },
});

const Category = model<ICategoryDocument>("Category", categorySchema);

export default Category;
