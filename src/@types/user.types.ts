import { Document } from "mongoose";

export type Role = "user" | "admin";

export interface IUserDocument extends Document {
  _id: string;
  id?: string;
  email: string;
  googleId: string;
  displayName: string;
  username: string;
  image: string;
  role: Role;
  createdAt: Date;
  isBanned: boolean;
}

export interface IUserToken {
  userId: string;
  role: string; // "user" | "admin"
}
