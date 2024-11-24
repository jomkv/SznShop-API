import { Schema, model } from "mongoose";
import { IAddress } from "../@types/address.types";

const addressSchema: Schema = new Schema<IAddress>({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  province: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  addressLabel: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
});

const Address = model<IAddress>("Address", addressSchema);

export default Address;
