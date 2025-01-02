import { Types, Document } from "mongoose";

export interface IRatingInput {
  comment: string;
  stars: number;
}

export interface IRating {
  orderProductId: Types.ObjectId;
  userId: Types.ObjectId;
  comment: string;
  stars: number;
}

export interface IRatingDocument extends IRating, Document {}
