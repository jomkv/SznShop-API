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

export interface ICategory extends Document {
  _id: string;
  id?: string;
  name: string; // unique
  showInMenu: boolean;
}

export interface ICategoryProduct extends Document {
  _id: string;
  id?: string;
  productId: Types.ObjectId;
  categoryId: Types.ObjectId;
}

export interface IStocks extends Document {
  _id: string;
  id?: string;
  productId: Types.ObjectId;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}
