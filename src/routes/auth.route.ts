import { Router } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User";
import { IUserDocument } from "../@types/user.types";
import BadRequestError from "../errors/BadRequestError";
dotenv.config();

// * Middlewares
import passport from "passport";
import asyncHandler from "express-async-handler";

const router = Router();

router.route("/login").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

if (process.env.NODE_ENV === "development") {
  router.route("/login-dev").post(
    asyncHandler(async (req, res) => {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        res.status(404);
        throw new BadRequestError("User not found");
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
      res.cookie("x-auth-cookie", token);
      res.status(200).json({ message: "Logged in" });
    })
  );
}

router.route("/redirect").get(
  passport.authenticate("google", {
    failureRedirect: "/api/auth/login",
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign(
      {
        userId: (req.user as IUserDocument)._id,
        role: (req.user as IUserDocument).role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "15d" }
    );

    res.cookie("x-auth-cookie", token);
    res.redirect(process.env.CLIENT_URL as string);
  }
);

export default router;
