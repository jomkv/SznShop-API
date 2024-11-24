import { Document } from "mongoose";

export interface IAddress {
  firstName: string;
  lastName: string;
  region: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  addressLabel: string;
  phoneNumber: string;
}

export interface IAddressDocument extends IAddress, Document {}
