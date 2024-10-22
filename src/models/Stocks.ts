import mongoose, { Schema, model } from "mongoose";
import { IStocks } from "../@types/product.types";

const stocksSchema: Schema = new Schema<IStocks>({
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
});

const Stocks = model<IStocks>("Stocks", stocksSchema);

export default Stocks;
