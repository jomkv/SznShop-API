import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { IUserDocument, IUserToken } from "../@types/user.types";
import dotenv from "dotenv";
dotenv.config();

// * Models
import User from "../models/User";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";

// @desc    Login as a developer
// @route   POST /api/auth/login-dev
// @access  Public
const loginDev = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
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
  }
);

// @desc    Logout of account, clear cookies
// @route   POST /api/auth/logout
// @access  Public
const logout = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    res.cookie("x-auth-cookie", "", {
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logged out successfully" });
  }
);

// @desc    Redirect user after login with auth cookie
// @route   POST /api/auth/redirect
// @access  Public
const handleRedirect = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const user = req.user as IUserDocument;

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "15d",
      }
    );

    const clientUrl = process.env.CLIENT_URL as string;
    const redirectUrl =
      user.role === "admin" ? `${clientUrl}/admin` : clientUrl;

    res.cookie("x-auth-cookie", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.redirect(redirectUrl);
  }
);

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userToken = req.sznUser as IUserToken;
    const user: IUserDocument | null = await User.findById(userToken.userId);

    if (!user) {
      res.status(404);
      throw new BadRequestError("User not found");
    }

    res.status(200).json({ user });
  }
);

export { loginDev, handleRedirect, getMe, logout };
