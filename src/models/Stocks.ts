import mongoose, { Schema, model } from "mongoose";
import { IStocksDocument } from "../@types/product.types";

const stocksSchema: Schema = new Schema<IStocksDocument>({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  xs: {
    type: Number,
    default: 0,
  },
  sm: {
    type: Number,
    default: 0,
  },
  md: {
    type: Number,
    default: 0,
  },
  lg: {
    type: Number,
    default: 0,
  },
  xl: {
    type: Number,
    default: 0,
  },
  xxl: {
    type: Number,
    default: 0,
  },
});

const Stocks = model<IStocksDocument>("Stocks", stocksSchema);

export default Stocks;
