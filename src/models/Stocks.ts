import mongoose, { Schema, model } from "mongoose";
import { IStocksDocument, Size } from "../@types/product.types";
import CartProduct from "./CartProduct";

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

stocksSchema.pre("save", async function (next) {
  const stocks = this as unknown as IStocksDocument;
  const cartItems = await CartProduct.find({ productId: stocks.productId });
  const session = stocks.$session();

  for (const cartItem of cartItems) {
    const size = cartItem.size as Size;
    const availableStock = stocks[size];

    // If the stock is enough, no need to change anything
    if (cartItem.quantity <= availableStock) {
      next();
      return;
    }

    if (availableStock > 0) {
      // If the stock is not enough, set the quantity to the available stock
      cartItem.quantity = availableStock;
      await cartItem.save({ session: session || undefined });
    } else {
      // if no stock is available, Delete the cart item
      await cartItem.deleteOne({ session: session || undefined });
    }
  }

  next();
});

const Stocks = model<IStocksDocument>("Stocks", stocksSchema);

export default Stocks;
