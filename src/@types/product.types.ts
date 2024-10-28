import { Document, Types } from "mongoose";
import { IImage } from "./image.types";

export interface IProductDocument extends Document {
  _id: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  images: IImage[];
  createdAt: Date;
  active: boolean;
}

export interface IProductInput {
  name: string;
  description: string;
  price: number;
  active?: boolean;
}

export interface ICategoryDocument extends Document {
  _id: string;
  id?: string;
  name: string; // unique
  showInMenu: boolean;
}

export interface ICategoryProductDocument extends Document {
  _id: string;
  id?: string;
  productId: Types.ObjectId;
  categoryId: Types.ObjectId;
}

export interface IStocksDocument extends Document {
  _id: string;
  id?: string;
  productId: Types.ObjectId;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface IStocksInput {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}
