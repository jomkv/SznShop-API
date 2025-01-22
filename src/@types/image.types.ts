import { Document } from "mongoose";

export interface IImage {
  url: string;
  publicId: string;
}

export interface IHomeCarousel {
  images: IImage[];
}

export interface IImageDocument extends IImage, Document {}

export interface IHomeCarouselDocument extends IHomeCarousel, Document {}
