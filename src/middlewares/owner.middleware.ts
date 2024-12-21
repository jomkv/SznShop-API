import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import AuthenticationError from "../errors/AuthenticationError";
import BadRequestError from "../errors/BadRequestError";
import { findOrderOrError } from "../utils/findOrError";

const orderProtect = (adminBypass: boolean) =>
  /**
   * Checks if user is the owner of the order and passes the order object along the request.
   * This middleware expects a parameter named id
   * OPTIONAL: admin can bypass this check
   *
   * @param {import('express').Request} req - The Express request object.
   * @param {import('express').Response} res - The Express response object.
   * @param {import('express').NextFunction} next - The Express next middleware function.
   * @throws {Error} Throws an error if user is not authorized
   */
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id) {
      throw new BadRequestError("Parameter ID not found");
    }

    const order = await findOrderOrError(req.params.id);

    req.order = order;

    if (adminBypass && req.sznUser?.role === "admin") {
      next();
      return;
    }

    if (order.userId.id.toString() !== req.sznUser?.userId) {
      throw new AuthenticationError();
    }

    next();
  });

export { orderProtect };
