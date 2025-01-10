import { Schema, model } from "mongoose";
import { IUserDocument } from "../@types/user.types";

const userSchema: Schema = new Schema<IUserDocument>({
  googleId: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
});

const User = model<IUserDocument>("User", userSchema);

export default User;
