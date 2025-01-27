import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

// * Models\
import User from "../models/User";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";
import AuthenticationError from "../errors/AuthenticationError";
import { IUserDocument, IUserToken } from "../@types/user.types";

// @desc    Get users
// @route   GET /api/user?query=role
// @access  Admin
const getUsers = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { role } = req.query;

    const users = await (role ? User.find({ role }) : User.find());

    res.status(200).json({ message: "Users fetched", users });
  }
);

// @desc    Get usernames and emails
// @route   GET /api/user/username-name
// @access  User & Admin
const getUsernameAndName = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const users = await User.find();

    const usernames = users.map((user) => user.username);
    const names = users.map((user) => user.displayName);

    res
      .status(200)
      .json({ message: "Usernames and Names fetched", usernames, names });
  }
);

// @desc    Edit profile
// @route   PUT /api/user
// @access  User & Admin
const editProfile = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { username, fullName } = req.body;

    if (!username || !fullName) {
      throw new BadRequestError("Incomplete Input");
    }

    const isTaken = await User.findOne({
      username,
    });

    if (isTaken) {
      throw new BadRequestError("Username taken");
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.sznUser?.userId,
        {
          username: username,
          displayName: fullName,
        },
        { new: true }
      );

      res.status(200).json({
        message: "Profile updated",
        updatedUser,
      });
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

// @desc    Get current user
// @route   GET /api/user/me
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

// @desc    Ban user
// @route   POST /api/user/:id
// @access  Admin
const banUser = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new BadRequestError("User not found");
    }

    user.isBanned = true;

    try {
      await user.save();

      res.status(200).json({ message: "User banned", user });
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

export { getUsers, getUsernameAndName, editProfile, banUser, getMe };
