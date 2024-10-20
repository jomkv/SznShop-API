import { Schema, model } from "mongoose";
import { IUser } from "../@types/user.types";

const userSchema: Schema = new Schema<IUser>({
  googleId: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = model<IUser>("User", userSchema);

export default User;
