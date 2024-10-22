import { Document, Types } from "mongoose";
import { IImage } from "./image.types";

export interface IProduct extends Document {
  _id: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  images: IImage[];
  createdAt: Date;
  active: boolean;
  isDeleted: boolean;
}

export interface IStocks extends Document {
  productId: Types.ObjectId;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}
