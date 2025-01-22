import { Schema, model } from "mongoose";
import imageSchema from "./schemas/image.schema";
import { IHomeCarouselDocument } from "../@types/image.types";

const homeCarouselSchema: Schema = new Schema<IHomeCarouselDocument>({
  images: {
    type: [imageSchema],
    default: [],
  },
});

const HomeCarousel = model<IHomeCarouselDocument>(
  "HomeCarousel",
  homeCarouselSchema
);

export default HomeCarousel;
