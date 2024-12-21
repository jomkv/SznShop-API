import { NextFunction, Request, Response } from "express";
import { IUserToken } from "../@types/user.types";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { IOrderDocument } from "../@types/order.types";

declare global {
  namespace Express {
    interface Request {
      sznUser?: IUserToken;
      order?: IOrderDocument;
    }
  }
}

const handleError = (res: Response, err: unknown) => {
  res.status(401);
  if (err instanceof jwt.JsonWebTokenError) {
    throw new Error("Invalid Token");
  } else if (err instanceof jwt.TokenExpiredError) {
    // TODO: refresh token
    // implement here

    throw new Error("Token expired");
  } else {
    throw new Error("Unable to decode JWT Token");
  }
};

const getToken = (req: Request, res: Response): string => {
  const token = req.cookies["x-auth-cookie"];

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  return token;
};

const getUserFromToken = (token: string): IUserToken => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as IUserToken;
};

/**
 * Checks req cookies if x-auth-cookie is provided
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @throws {Error} Throws an error x-auth-cookie is not valid or not provided.
 */
const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = getToken(req, res);

    try {
      const user: IUserToken = getUserFromToken(token);

      req.sznUser = user;

      next();
    } catch (err) {
      handleError(res, err);
    }
  }
);

/**
 * Checks x-auth-cookie if provided and checks if role is admin
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @throws {Error} Throws an error x-auth-cookie is not valid, not provided or role is not admin.
 */
const adminProtect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = getToken(req, res);
    let user: IUserToken | null = null;

    try {
      user = getUserFromToken(token);
    } catch (err) {
      handleError(res, err);
    }

    if (!user) {
      res.status(401);
      throw new Error("Not authorized, no token provided");
    }

    if (user.role !== "admin") {
      res.status(401);
      throw new Error("Not authorized, not an admin");
    }

    req.sznUser = user;

    next();
  }
);

/**
 * Processes x-auth-cookie if possible,
 * but will not throw an error if not provided
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @throws {Error} Does not interrupt req if an error is thrown
 */
const optionalProtect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies["x-auth-cookie"];

    if (token) {
      try {
        req.user = getUserFromToken(token);
      } catch (err) {
        // Do nothing
      }
    }

    next();
  }
);

export { protect, adminProtect, optionalProtect };
