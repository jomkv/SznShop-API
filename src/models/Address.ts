import { Schema, model } from "mongoose";
import { IAddress } from "../@types/address.types";

const addressSchema: Schema = new Schema<IAddress>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
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
  municipality: {
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
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const Address = model<IAddress>("Address", addressSchema);

export default Address;
