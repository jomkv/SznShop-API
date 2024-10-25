import { Router } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// * Middlewares
import passport from "passport";

// * Controllers
import { IUser } from "../@types/user.types";

const router = Router();

router.route("/login").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.route("/redirect").get(
  passport.authenticate("google", {
    failureRedirect: "/api/auth/login",
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign(
      { userId: (req.user as IUser)._id, role: (req.user as IUser).role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.cookie("x-auth-cookie", token);
    res.redirect(process.env.CLIENT_URL as string);
  }
);

export default router;
