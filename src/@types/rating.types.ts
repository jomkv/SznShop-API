import { Types, Document } from "mongoose";
import { IUserDocument } from "./user.types";

export interface IRatingInput {
  comment: string;
  stars: number;
}

export interface IRating {
  orderProductId: Types.ObjectId;
  productId: Types.ObjectId;
  userId: Types.ObjectId | IUserDocument;
  comment: string;
  stars: number;
}

export interface IRatingDocument extends IRating, Document {}
