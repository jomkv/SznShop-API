import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import {
  findOrderOrError,
  findOrderProductOrError,
} from "../utils/findOrError";
import { IRatingInput, IRatingDocument } from "../@types/rating.types";
import { IOrderProductDocument } from "../@types/order.types";
import { startSession } from "mongoose";

// * Models
import Rating from "../models/Rating";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";
import AuthenticationError from "../errors/AuthenticationError";

// @desc    Create Rating(s)
// @route   POST /api/rating/:id
// @access  User
const createRating = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const orderId: string = req.params.id;
    const ratings: IRatingInput = req.body.ratings;

    const order = await findOrderOrError(orderId);
    let newRatingsPromises = [];

    // If order is not yet complete
    if (order.status !== "COMPLETED") {
      throw new BadRequestError(
        "Unable to rate an order that is not yet completed"
      );
    }

    for (const orderProductId in ratings) {
      if (ratings.hasOwnProperty(orderProductId)) {
        const { stars, comment } = ratings[orderProductId];

        const orderProduct: IOrderProductDocument =
          await findOrderProductOrError(orderProductId);

        // If user is not the owner of the order
        if (order.userId.id.toString() !== req.sznUser?.userId) {
          throw new AuthenticationError();
        }

        if (!stars) {
          throw new BadRequestError("Incomplete input");
        }

        if (!(stars >= 1 && stars <= 5)) {
          throw new BadRequestError("Stars must be within 1-5 only");
        }

        // Look for a rating that already exists
        const existingRating: IRatingDocument | null = await Rating.findOne({
          userId: req.sznUser?.userId,
          orderProductId,
        });

        if (existingRating) {
          throw new BadRequestError("A rating for this already exists");
        }

        newRatingsPromises.push({
          orderProductId: orderProduct.id,
          productId: orderProduct.productId._id,
          userId: req.sznUser?.userId,
          comment,
          stars,
        });
      }
    }

    const newRatings: any[] = await Promise.all(newRatingsPromises);
    order.isRated = true;

    const session = await startSession();
    session.startTransaction();

    try {
      await Rating.insertMany(newRatings, { session });
      await order.save({ session });

      await session.commitTransaction();

      return res.status(201).json({
        message: "Ratings successfully created",
        newRatings,
      });
    } catch (error) {
      await session.abortTransaction();
      throw new DatabaseError();
    }
  }
);

// @desc    Get ratings for a specific product
// @route   GET /api/rating/:id
// @access  User
const getProductRatings = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const ratings: IRatingDocument[] = await Rating.find({
      productId: req.params.id,
    });

    res.status(200).json({
      message: "Ratings for product fetched",
      ratings,
    });
  }
);

export { createRating, getProductRatings };
