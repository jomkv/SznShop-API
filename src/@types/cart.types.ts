import { Document, Types } from "mongoose";
import { Size } from "./product.types";

export interface ICartProduct {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
  size: Size;
}

export interface ICartProductDocument extends ICartProduct, Document {}
