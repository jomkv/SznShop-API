import { Document } from "mongoose";

export interface IImage {
  url: string;
  publicId: string;
}

export interface IImageDocument extends IImage, Document {}
