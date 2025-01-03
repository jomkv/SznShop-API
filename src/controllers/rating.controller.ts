import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { findOrderProductOrError } from "../utils/findOrError";
import { IRatingDocument, IRatingInput } from "../@types/rating.types";
import { IOrderDocument, IOrderProductDocument } from "../@types/order.types";

// * Models
import Rating from "../models/Rating";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";
import AuthenticationError from "../errors/AuthenticationError";

// @desc    Create Rating
// @route   POST /api/rating/:id
// @access  User
const createRating = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const orderProductId: string = req.params.id;
    const { comment, stars }: IRatingInput = req.body;

    const orderProduct: IOrderProductDocument = await findOrderProductOrError(
      orderProductId
    );
    await orderProduct.populate("orderId");

    const order = orderProduct.orderId as IOrderDocument;

    // If user is not the owner of the order
    if (order.userId.id.toString() !== req.sznUser?.userId) {
      throw new AuthenticationError();
    }

    // If order is not yet complete
    if (order.status !== "COMPLETED") {
      throw new BadRequestError(
        "Unable to rate an order that is not yet completed"
      );
    }

    if (!stars || !comment) {
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
      throw new BadRequestError(
        "A rating for this order product already exists"
      );
    }

    try {
      const newRating = new Rating({
        userId: req.sznUser?.userId,
        orderProductId,
        productId: orderProduct.productId.id,
        stars,
        comment,
      });

      await newRating.save();

      return res.status(201).json({
        message: "Rating successfully created",
        newRating,
      });
    } catch (error) {
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
