import { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";

/**
 * Used for routes that have MongoDB IDs as params.
 * This validates ALL given param ID.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @throws {Error} Throws an error if any param ID is not a valid MongoDB ID
 */
const checkParamIds = (req: Request, res: Response, next: NextFunction) => {
  // iterate through params and get invalid IDs if any
  const invalidIds = Object.entries(req.params).filter(
    ([_, value]) => !isValidObjectId(value)
  );

  if (invalidIds.length > 0) {
    const invalidIdMessages = invalidIds.map(
      ([key, value]) => `Invalid ObjectId for parameter [${key}]: ${value}`
    );
    res.status(400);
    throw new Error(invalidIdMessages.join(", "));
  }

  next();
};

export default checkParamIds;
