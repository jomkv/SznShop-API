import multer from "multer";
import BadRequestError from "../errors/BadRequestError";
import { Request, Response, NextFunction } from "express";

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: any, cb: any) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/svg+xml" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Invalid image file"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10mb
  },
}).array("images", 4);

const uploader = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      return next(new Error(`Multer Error ${err.message}`));
    } else if (err) {
      return next(new Error(err.message));
    }

    next();
  });
};

export default uploader;
