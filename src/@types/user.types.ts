import { Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  id?: string;
  googleId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  image: string;
  role: string;
  createdAt: Date;
}
