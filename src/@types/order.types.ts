import { IAddressInput } from "./address.types";
import { Size } from "./product.types";
import { Document, Types } from "mongoose";

export type Status =
  | "REVIEWING"
  | "SHIPPING"
  | "RECEIVED"
  | "COMPLETED"
  | "CANCELLED"
  | "RETURN"
  | "REFUND";

export interface IOrderProductInput {
  productId: string;
  quantity: number;
  size: Size;
}

export interface IOrderProduct {
  orderId: Types.ObjectId;
  productId: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  quantity: number;
  size: Size;
}

export interface IOrderProductDocument extends IOrderProduct, Document {}

export interface IOrderAddress extends IAddressInput {}

export interface IOrderTimestamps {
  reviewedAt: Date;
  shippedAt: Date;
  receivedAt: Date;
  completedAt: Date;
  cancelledAt: Date;
  returnedAt: Date;
  refundedAt: Date;
}

export interface IOrder {
  address: IOrderAddress;
  timestamps: IOrderTimestamps;
  status: Status;
}

export interface IOrderDocument extends IOrder, Document {
  createdAt: Date;
}
