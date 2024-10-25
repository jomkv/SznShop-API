import { Document } from "mongoose";

export interface IUser extends Document {
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
