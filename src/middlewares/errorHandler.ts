import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import CustomError from "../errors/CustomError";

const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.log(err);

  if (err instanceof CustomError) {
    res.status(err.StatusCode).json(err.serialize());
    return;
  }
  // Default status code to 500 if non-existent
  let statusCode: number = res.statusCode ? res.statusCode : 500;

  statusCode = statusCode < 300 ? 500 : statusCode;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorHandler;
