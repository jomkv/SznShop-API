import { Document, Types } from "mongoose";
import { IImage } from "./image.types";

export type Size = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

export interface IProductDocument extends Document {
  _id: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  images: IImage[];
  createdAt: Date;
  active: boolean;
  stocks: IStocksDocument;
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
  description: string;
  showInMenu: boolean;
}

export interface ICategoryInput {
  name: string;
  description: string;
  showInMenu?: boolean;
  productIds?: string[];
}

export interface ICategoryProductDocument extends Document {
  _id: string;
  id?: string;
  productId: Types.ObjectId;
  categoryId: Types.ObjectId;
  product?: IProductDocument;
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
  xxl: number;
}

export interface IStocksInput {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export const allowedSizes: Size[] = ["xs", "sm", "md", "lg", "xl", "xxl"];
