import { Schema, model } from "mongoose";
import { IImageDocument } from "../../@types/image.types";

const imageSchema: Schema = new Schema<IImageDocument>({
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
