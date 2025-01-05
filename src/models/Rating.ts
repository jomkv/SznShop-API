import mongoose, { Schema, model } from "mongoose";
import { IRating } from "../@types/rating.types";

const ratingSchema: Schema = new Schema<IRating>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderProductId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "OrderProduct",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    stars: {
      type: Number,
      required: true,
      max: 5,
      min: 1,
      default: 1,
    },
    comment: {
      type: String,
      required: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    timestamps: true,
  }
);

ratingSchema.pre(["find", "findOne"], function (next) {
  this.populate("userId");
  next();
});

const Rating = model<IRating>("Rating", ratingSchema);

export default Rating;
