import { Document, Types } from "mongoose";

export interface IAddressInput {
  firstName: string;
  lastName: string;
  region: string;
  province: string;
  municipality: string;
  address: string;
  postalCode: string;
  addressLabel: string;
  phoneNumber: string;
}

export interface IAddress extends IAddressInput {
  userId: Types.ObjectId;
  isDefault: boolean;
}

export interface IAddressDocument extends IAddress, Document {}
