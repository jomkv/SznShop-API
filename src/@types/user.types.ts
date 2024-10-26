import { Document } from "mongoose";

export interface IUserDocument extends Document {
  _id: string;
  id?: string;
  email: string;
  googleId: string;
  displayName: string;
  username: string;
  image: string;
  role: string;
  createdAt: Date;
}

export interface IUserToken {
  userId: string;
  role: string; // "user" | "admin"
}
