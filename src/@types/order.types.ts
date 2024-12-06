import { IAddressInput } from "./address.types";
import { Size } from "./product.types";
import { Document } from "mongoose";

export type Status =
  | "REVIEWING"
  | "SHIPPING"
  | "RECEIVED"
  | "COMPLETED"
  | "CANCELLED"
  | "RETURN"
  | "REFUND";

export interface IOrderProduct {
  name: string;
  description: string;
  price: number;
}

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
  product: IOrderProduct;
  address: IOrderAddress;
  timestamps: IOrderTimestamps;
  size: Size;
  quantity: number;
  status: Status;
}

export interface IOrderDocument extends IOrder, Document {
  createdAt: Date;
}
