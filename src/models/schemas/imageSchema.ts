import { Schema, model } from "mongoose";
import { IImage } from "../../@types/image.types";

const imageSchema: Schema = new Schema<IImage>({
  url: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
});

export default imageSchema;
