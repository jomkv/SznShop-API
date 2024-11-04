import { Router } from "express";

// * Middlewares
import passport from "passport";
import { protect } from "../middlewares/auth.middleware";

// * Controllers
import {
  loginDev,
  logout,
  handleRedirect,
  getMe,
} from "../controllers/auth.controller";

const router = Router();

router.route("/login").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.route("/logout").post(logout);

if (process.env.NODE_ENV === "development") {
  router.route("/login-dev").post(loginDev);
}

router.route("/redirect").get(
  passport.authenticate("google", {
    failureRedirect: "/api/auth/login",
    session: false,
  }),
  handleRedirect
);

router.route("/me").get(protect, getMe);

export default router;
